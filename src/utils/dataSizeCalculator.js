// 데이터 크기 계산 유틸리티

export const calculateDataSize = (wordBooks) => {
  const jsonString = JSON.stringify(wordBooks);
  const sizeInBytes = new Blob([jsonString]).size;
  
  return {
    bytes: sizeInBytes,
    kb: Math.round(sizeInBytes / 1024 * 100) / 100,
    mb: Math.round(sizeInBytes / (1024 * 1024) * 100) / 100,
    readable: formatBytes(sizeInBytes)
  };
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 데이터 크기 예측
export const predictDataSize = (wordBooksCount, avgWordsPerBook, avgWordLength) => {
  // JSON 구조 오버헤드 포함 예상 크기 계산
  const baseStructureSize = 200; // JSON 기본 구조
  const wordBookOverhead = 150; // 단어장당 메타데이터
  const wordOverhead = 80; // 단어당 JSON 구조 오버헤드
  
  const estimatedSize = 
    baseStructureSize + 
    (wordBooksCount * wordBookOverhead) +
    (wordBooksCount * avgWordsPerBook * (avgWordLength * 2 + wordOverhead));
  
  return {
    bytes: estimatedSize,
    readable: formatBytes(estimatedSize)
  };
};

// 브라우저 한계 확인
export const checkBrowserLimits = (sizeInBytes) => {
  const limits = {
    // 일반적인 브라우저 한계들
    blobSize: 2 * 1024 * 1024 * 1024, // 2GB (이론적 한계)
    practicalLimit: 100 * 1024 * 1024, // 100MB (실용적 한계)
    downloadLimit: 50 * 1024 * 1024, // 50MB (권장 한계)
    memoryLimit: 512 * 1024 * 1024 // 512MB (메모리 사용량)
  };
  
  return {
    withinBlobLimit: sizeInBytes < limits.blobSize,
    withinPracticalLimit: sizeInBytes < limits.practicalLimit,
    withinDownloadLimit: sizeInBytes < limits.downloadLimit,
    withinMemoryLimit: sizeInBytes < limits.memoryLimit,
    warnings: getWarnings(sizeInBytes, limits)
  };
};

const getWarnings = (size, limits) => {
  const warnings = [];
  
  if (size > limits.downloadLimit) {
    warnings.push('다운로드 속도가 느려질 수 있습니다');
  }
  
  if (size > limits.practicalLimit) {
    warnings.push('브라우저가 느려질 수 있습니다');
  }
  
  if (size > limits.memoryLimit) {
    warnings.push('메모리 부족으로 인한 오류 가능성');
  }
  
  return warnings;
}; 