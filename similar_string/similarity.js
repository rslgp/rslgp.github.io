// =============================================================================
// STRING SIMILARITY ALGORITHMS - COMPLETE IMPLEMENTATION (by Claude)
// =============================================================================

// 1. LEVENSHTEIN DISTANCE (Your current implementation - optimized)
function levenshteinDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;
  
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,     // deletion
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  return matrix[s2.length][s1.length];
}

function levenshteinSimilarity(s1, s2) {
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1.0;
  return (maxLength - levenshteinDistance(s1, s2)) / maxLength;
}

// 2. JARO DISTANCE (Better for names)
function jaroDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  if (matchWindow < 0) return 0.0;
  
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Find transpositions
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  return (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3.0;
}

// 3. JARO-WINKLER DISTANCE (Enhanced Jaro for common prefixes)
function jaroWinklerDistance(s1, s2, prefixScale = 0.1) {
  const jaroSim = jaroDistance(s1, s2);
  
  if (jaroSim < 0.7) return jaroSim;
  
  // Calculate common prefix length (up to 4 characters)
  let prefixLength = 0;
  const maxPrefix = Math.min(4, Math.min(s1.length, s2.length));
  
  for (let i = 0; i < maxPrefix; i++) {
    if (s1.toLowerCase()[i] === s2.toLowerCase()[i]) {
      prefixLength++;
    } else {
      break;
    }
  }
  
  return jaroSim + (prefixLength * prefixScale * (1 - jaroSim));
}

// 4. DICE COEFFICIENT (Good for longer strings)
function diceCoefficient(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;
  
  const bigrams1 = new Set();
  const bigrams2 = new Set();
  
  for (let i = 0; i < s1.length - 1; i++) {
    bigrams1.add(s1.substr(i, 2));
  }
  
  for (let i = 0; i < s2.length - 1; i++) {
    bigrams2.add(s2.substr(i, 2));
  }
  
  const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
  return (2 * intersection.size) / (bigrams1.size + bigrams2.size);
}

// 5. COSINE SIMILARITY (Character frequency based)
function cosineSimilarity(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  
  const getCharFrequency = (str) => {
    const freq = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    return freq;
  };
  
  const freq1 = getCharFrequency(s1);
  const freq2 = getCharFrequency(s2);
  
  const allChars = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (const char of allChars) {
    const f1 = freq1[char] || 0;
    const f2 = freq2[char] || 0;
    
    dotProduct += f1 * f2;
    magnitude1 += f1 * f1;
    magnitude2 += f2 * f2;
  }
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Enhanced text normalization for names
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .replace(/[^a-z\s]/g, '') // Keep only letters and spaces
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Remove common prefixes/suffixes that might interfere
function cleanNameForMatching(name) {
  const prefixes = ['dr', 'dra', 'prof', 'sr', 'sra'];
  const suffixes = ['jr', 'senior', 'filho'];
  
  let cleaned = normalizeText(name);
  
  // Remove prefixes
  for (const prefix of prefixes) {
    const regex = new RegExp(`^${prefix}\\.?\\s+`, 'i');
    cleaned = cleaned.replace(regex, '');
  }
  
  // Remove suffixes
  for (const suffix of suffixes) {
    const regex = new RegExp(`\\s+${suffix}\\.?$`, 'i');
    cleaned = cleaned.replace(regex, '');
  }
  
  return cleaned.trim();
}

// =============================================================================
// MAIN MATCHING FUNCTIONS
// =============================================================================

// Single algorithm matcher (your current approach)
function findMostSimilarName(targetName, doctorList, algorithm = 'levenshtein') {
  const algorithms = {
    levenshtein: levenshteinSimilarity,
    jaro: jaroDistance,
    jaroWinkler: jaroWinklerDistance,
    dice: diceCoefficient,
    cosine: cosineSimilarity
  };
  
  const similarityFunc = algorithms[algorithm];
  if (!similarityFunc) throw new Error(`Unknown algorithm: ${algorithm}`);
  
  let mostSimilar = null;
  let highestSimilarity = -1;
  
  const cleanTarget = cleanNameForMatching(targetName);
  
  for (const doctor of doctorList) {
    const cleanDoctorName = cleanNameForMatching(doctor.nome);
    const score = similarityFunc(cleanTarget, cleanDoctorName);
    
    if (score > highestSimilarity) {
      highestSimilarity = score;
      mostSimilar = { ...doctor, similarityScore: score };
    }
  }
  
  return mostSimilar;
}

// Multi-algorithm matcher with weighted scoring
function findBestMatch(targetName, doctorList, weights = null) {
  const defaultWeights = {
    levenshtein: 0.25,
    jaro: 0.25,
    jaroWinkler: 0.30,
    dice: 0.10,
    cosine: 0.10
  };
  
  const finalWeights = weights || defaultWeights;
  const cleanTarget = cleanNameForMatching(targetName);
  
  const candidates = doctorList.map(doctor => {
    const cleanDoctorName = cleanNameForMatching(doctor.nome);
    
    const scores = {
      levenshtein: levenshteinSimilarity(cleanTarget, cleanDoctorName),
      jaro: jaroDistance(cleanTarget, cleanDoctorName),
      jaroWinkler: jaroWinklerDistance(cleanTarget, cleanDoctorName),
      dice: diceCoefficient(cleanTarget, cleanDoctorName),
      cosine: cosineSimilarity(cleanTarget, cleanDoctorName)
    };
    
    const finalScore = Object.entries(finalWeights)
      .reduce((sum, [algorithm, weight]) => sum + (scores[algorithm] * weight), 0);
    
    return {
      doctor,
      scores,
      finalScore,
      originalName: doctor.nome,
      cleanedName: cleanDoctorName
    };
  });
  
  return candidates.sort((a, b) => b.finalScore - a.finalScore)[0];
}

// Get top N matches with detailed scoring
function getTopMatches(targetName, doctorList, topN = 5, algorithm = 'jaroWinkler') {
  const algorithms = {
    levenshtein: levenshteinSimilarity,
    jaro: jaroDistance,
    jaroWinkler: jaroWinklerDistance,
    dice: diceCoefficient,
    cosine: cosineSimilarity
  };
  
  const similarityFunc = algorithms[algorithm];
  const cleanTarget = cleanNameForMatching(targetName);
  
  const matches = doctorList.map(doctor => {
    const cleanDoctorName = cleanNameForMatching(doctor.nome);
    const score = similarityFunc(cleanTarget, cleanDoctorName);
    
    return {
      doctor,
      score,
      originalName: doctor.nome,
      cleanedName: cleanDoctorName
    };
  });
  
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

// Example usage with your data structure
function exampleUsage() {
  // Assuming your doctors array structure
  const doctors = [
    { nome: "Dr. João Silva", especialidade: "Cardiologia" },
    { nome: "Dra. Maria Santos", especialidade: "Pediatria" },
    { nome: "Prof. Carlos Oliveira", especialidade: "Neurologia" }
  ];
  
  const targetName = "joao silva";
  
  // Method 1: Single algorithm (recommended: Jaro-Winkler for names)
  const bestMatch = findMostSimilarName(targetName, doctors, 'jaroWinkler');
  console.log("Best match (Jaro-Winkler):", bestMatch);
  
  // Method 2: Multi-algorithm weighted approach
  const bestWeightedMatch = findBestMatch(targetName, doctors);
  console.log("Best weighted match:", bestWeightedMatch);
  
  // Method 3: Get top 3 matches with scores
  const topMatches = getTopMatches(targetName, doctors, 3, 'jaroWinkler');
  console.log("Top 3 matches:", topMatches);
  
  return bestMatch;
}

// =============================================================================
// INTEGRATION WITH YOUR EXISTING CODE
// =============================================================================

// Drop-in replacement for your current function
function findMostSimilarNameImproved(targetName, doctorList) {
  // Uses Jaro-Winkler which is generally better for names
  return findMostSimilarName(targetName, doctorList, 'jaroWinkler');
}
