const sentiment = {
    good : "positive",
    neut: "neutral",
    bad: "negative"
} as const

const analyzeFeedback = (message: string) => {
  const lowerMessage = message.toLowerCase().trim();

  // Positive keywords and phrases
  const positiveKeywords = [
  'good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'perfect', 'best',
  'fantastic', 'wonderful', 'superb', 'outstanding', 'impressed', 'satisfied',
  'happy', 'grateful', 'appreciate', 'recommend', 'helpful', 'useful', 'nice',
  'brilliant', 'worked well', 'smooth', 'easy', 'quick', 'efficient', '😊', '❤️', '⭐',
  'thumbs up', '👍', 'five stars', '5 stars', 'highly recommend',
  
  // Tagalog/Filipino positive words and phrases
  'maganda', 'mabuti', 'mahusay', 'ayos', 'astig', 'ang ganda', 'ang galing',
  'napakaganda', 'napakahusay', 'sobrang ganda', 'sobrang ayos', 'panalo',
  'sulit', 'masaya', 'natutuwa', 'gustong gusto', 'maayos', 'okay na okay',
  'nakakatuwa', 'mahal ko', 'salamat', 'maraming salamat', 'wow', 'bilis',
  'madali gamitin', 'rekomendado', 'paborito', 'malupit', 'the best', 'ayos na ayos',
  'wala akong masabi', 'solid', 'quality', 'magaling', 'nakakabilib', 'paldo'
];


  // Negative keywords and phrases
 const negativeKeywords = [
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate', 'useless',
  'waste', 'disappointing', 'broken', 'failed', 'annoying', 'frustrated',
  'angry', 'disappointed', 'not good', 'problems', 'issue', 'bug', 'error',
  'slow', 'difficult', 'complicated', "doesn't work", 'not working', '😞', '😤', '😠',
  'thumbs down', '👎', 'one star', '1 star', 'never again', 'avoid', 'panget',

  // Tagalog/Filipino negative words and phrases
  'pangit', 'masama', 'sobrang pangit', 'di maganda', 'di gumagana',
  'hindi gumagana', 'sayang', 'nakakainis', 'nakakadismaya', 'nakakabadtrip',
  'nakakairita', 'nakakapagod', 'nakakalungkot', 'malas', 'palpak', 'sirain',
  'sira', 'basura', 'loko', 'walang kwenta', 'walang silbi', 'hindi okay',
  'hindi maayos', 'mahirap gamitin', 'bagal', 'sobrang bagal', 'hindi ko gusto',
  'hindi sulit', 'hindi maganda', 'nainis ako', 'di ko gusto', 'di sulit',
  'di maayos', 'worst ever', 'hindi recommend', 'di recommend', 'ayoko',
  'nakakaasar', 'hindi worth it', 'not worth it',
];


  // Count keyword matches
  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach((keyword) => {
    if (lowerMessage.includes(keyword)) positiveCount++;
  });

  negativeKeywords.forEach((keyword) => {
    if (lowerMessage.includes(keyword)) negativeCount++;
  });

  // Determine sentiment
  if (positiveCount > negativeCount) {
    return { isPositive: true, sentiment: sentiment.good };
  } else if (negativeCount > positiveCount) {
    return { isPositive: false, sentiment: sentiment.bad };
  } else {
    return { isPositive: false, sentiment: sentiment.neut }; // Neutral is treated as acceptable
  }
};

// Main filter function
export const filterGoodFeedbacks = (feedbacks: any[]) => {
  const classified = feedbacks.map((feedback) => ({
    ...feedback,
    analysis: analyzeFeedback(feedback.message),
  }));

  return {
    good: classified.filter((f) => f.analysis.isPositive),
    bad: classified.filter((f) => !f.analysis.isPositive),
    all: classified,
  };
};