import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const dbFile = path.resolve('data/fitting-history.json');

const readHistory = async () => {
  try {
    return JSON.parse(await fs.readFile(dbFile, 'utf8'));
  } catch {
    return [];
  }
};

const jsonBody = async (req) => {
  let body = '';

  for await (const chunk of req) {
    body += chunk;
  }

  return JSON.parse(body || '{}');
};

async function createFitting(body) {
  if (!process.env.BFL_API_KEY) {
    throw new Error('BFL_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }

  if (!body.personImage || !body.garmentImage) {
    throw new Error('아바타 이미지와 상품 이미지가 필요합니다.');
  }

  const response = await fetch('https://api.bfl.ai/v1/flux-2-pro-preview', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'x-key': process.env.BFL_API_KEY,
    },
    body: JSON.stringify({
      prompt: `
Use image 1 as the main person.

Preserve the person's face, hairstyle, body proportions, pose,
clothing, lighting, and camera angle.

Use image 2 only as the handbag reference.

Place the handbag naturally on the person as if they are
realistically carrying or wearing it.

Preserve the handbag's original shape, color, material,
pattern, logo, hardware, and proportions.

Do not redesign the person.
Only add the handbag naturally.

Make the entire background of the final image transparent.
Keep only the person and the handbag.
The final image must have a clean transparent background with no scenery,
objects, floor, shadows, or background elements.
Preserve clean and accurate edges around the person, hair, clothing,
and handbag.
      `.trim(),
      input_image: body.personImage,
      input_image_2: body.garmentImage,
      output_format: 'png',
    }),
  });

  if (!response.ok) {
    throw new Error(`BFL 요청 실패 (${response.status}): ${await response.text()}`);
  }

  const task = await response.json();

  if (!task.polling_url) {
    throw new Error('BFL polling_url을 받지 못했습니다.');
  }

  for (let i = 0; i < 120; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const pollResponse = await fetch(task.polling_url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-key': process.env.BFL_API_KEY,
      },
    });

    if (!pollResponse.ok) {
      throw new Error(`BFL 결과 조회 실패 (${pollResponse.status}): ${await pollResponse.text()}`);
    }

    const result = await pollResponse.json();

    if (result.status === 'Ready') {
      if (!result.result?.sample) {
        throw new Error('BFL 생성 이미지 URL을 받지 못했습니다.');
      }

      return result.result.sample;
    }

    if (['Error', 'Failed'].includes(result.status)) {
      throw new Error(`BFL 생성 실패: ${JSON.stringify(result)}`);
    }
  }

  throw new Error('BFL 생성 시간이 초과되었습니다.');
}

function fittingApi() {
  return {
    name: 'fitting-api',

    configureServer(server) {
      server.middlewares.use('/api/fitting', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.method === 'GET') {
            res.end(JSON.stringify(await readHistory()));
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: '지원하지 않는 요청 방식입니다.' }));
            return;
          }

          const body = await jsonBody(req);
          const imageUrl = await createFitting(body);
          const history = await readHistory();

          const record = {
            id: crypto.randomUUID(),
            productId: body.productId,
            productName: body.productName,
            imageUrl,
            createdAt: new Date().toISOString(),
          };

          await fs.mkdir(path.dirname(dbFile), { recursive: true });
          await fs.writeFile(
            dbFile,
            JSON.stringify([record, ...history].slice(0, 30), null, 2)
          );

          res.end(JSON.stringify(record));
        } catch (error) {
          console.error('Fitting API error:', error);

          res.statusCode = 500;
          res.end(JSON.stringify({
            error: error.message,
          }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [
      react(),
      fittingApi(),
    ],
  };
});