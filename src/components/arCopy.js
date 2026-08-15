export const arCopy = {
  ko: {
    intro: '나만의 MCM 스타일을 만나보세요.', memberQuestion: 'MCM 회원이신가요?', yes: '네', no: '아니요', memberLogin: 'MCM 회원 로그인을 진행해주세요.', qrLine1: 'QR을 스캔하면', qrLine2: '나의 쇼핑 여정을 불러올 수 있어요.', loginDone: '로그인 완료', loadingJourney: '지난번 MCM에서의 쇼핑 여정을 불러오고 있어요...', continueTitle: '지난번의 쇼핑 여정을 이어서 시작하겠습니다.', continueCopy1: '오늘도 고객님의 스타일에 맞춰', continueCopy2: '새로운 MCM 경험을 준비했어요.', continue: '계속하기', gender: '당신의 성별을 선택해주세요.', female: '여성', male: '남성', consentTitle: '나만을 위한 피팅을 준비할게요.', consentDescription1: '카메라를 통해 신체 형태와 현재 착장을 인식해', consentDescription2: '나에게 어울리는 스타일을 확인합니다.', consentQuestion: '개인정보 수집 및 이용에 동의하십니까?', consentButton: '동의하고 스캔 시작', scanTitle: '스캔을 준비하고 있습니다.', scanLine1: '바닥의 가이드 라인에 맞춰 서주세요.', scanLine2: '화면의 실루엣에 맞춰 자연스럽게 정면을 바라봐 주세요.', scanning: '당신의 스타일을 살펴보고 있어요.', avatarGenerating: '오늘의 쇼핑 여정을 담은 Avatar를 만들고 있어요.', finishFitting: '피팅 종료하기', close: '닫기', completeTitle: '오늘의 스타일이 완성됐어요.', finishAr: 'AR 피팅 마치기', qr1: '오늘의 피팅 결과를 저장하고, 다음 쇼핑에서도 이어서 만나보세요.', qr2: 'QR을 스캔하면 온라인과 다음 MCM 방문에서 오늘의 스타일을 다시 확인할 수 있어요.', tryout: '시착을 원하신 상품은 직원이 준비하고 있습니다.', showcase: '기다리는 동안 3F 전광판에서 MCM의 새로운 쇼케이스를 만나보세요.', confirmFinish: '확인 및 종료하기', history: '지금까지 피팅한 상품을 확인해보세요.', heart: '마음에 드는 상품은 하트로 저장하세요.', hanger: '직접 입고 싶은 상품은 옷걸이를 눌러보세요.', commentTop: '선택에 따라 달라지는 쇼핑 코멘트를 확인해보세요.', commentBottom: '피팅을 마치고 나만의 스타일을 확인해보세요.', product: '원하는 MCM 아이템을 선택해보세요.', productDetail: '상품 상세를 확인하고 피팅할 수 있어요.', refresh: '새로운 선택을 받고 싶다면 새로고침을 눌러주세요.', fittingFinish: '피팅 종료하기',
  },
  en: {
    intro: 'Discover your own MCM style.',
    memberQuestion: 'Are you an MCM member?', yes: 'Yes', no: 'No',
    memberLogin: 'Please log in to your MCM account.', qrLine1: 'Scan the QR code', qrLine2: 'to load your shopping journey.', loginDone: 'Login complete',
    loadingJourney: 'Loading your previous MCM shopping journey...',
    continueTitle: "Let's pick up where you left off.", continueCopy1: "We've prepared a new MCM experience", continueCopy2: 'tailored to your style.', continue: 'Continue',
    gender: 'Please select your gender.', female: 'Female', male: 'Male',
    consentTitle: "Let's prepare a fitting just for you.", consentDescription1: "Using the camera, we'll detect your body shape and current outfit", consentDescription2: 'to find styles that suit you.', consentQuestion: 'Do you agree to the collection and use of your personal information?', consentButton: 'Agree & Start Scan',
    scanTitle: 'Preparing your scan...', scanLine1: 'Please stand within the guide lines on the floor.', scanLine2: 'Face forward naturally and align yourself with the silhouette on the screen.', scanning: "We're getting to know your style.",
    avatarGenerating: "Creating an avatar from today's journey.",
    finishFitting: 'Finish Fitting', close: 'Close',
    completeTitle: 'Your style for today is complete.', finishAr: 'Finish AR Fitting', qr1: "Save today's fitting results and continue your MCM journey next time.", qr2: "Scan the QR code to revisit today's style online or on your next visit to MCM.",
    tryout: 'The items you requested to try on are being prepared by our staff.', showcase: "While you wait, discover MCM's new showcase on the 3F display.", confirmFinish: 'Confirm & Finish',
    history: "View the items you've tried on so far.", heart: 'Tap the heart to save items you like.', hanger: "Tap the hanger for items you'd like to try on in person.", commentTop: 'See personalized shopping comments based on your choices.', commentBottom: 'Finish your fitting to discover your personal style.', product: "Choose an MCM item you'd like to try.", productDetail: 'View the product details and try it on.', refresh: 'Tap refresh to see a new selection.', fittingFinish: 'Finish Fitting',
  },
};

export const getArCopy = (language) => arCopy[language] || arCopy.ko;
