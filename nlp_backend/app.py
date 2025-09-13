from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
import spacy
import nltk
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from supabase import create_client, Client
import json
import re
from typing import Dict, List, Any

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:8083", "http://localhost:3001"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

# Load NLP models
try:
    # Load spaCy model for NER and linguistic analysis
    nlp = spacy.load("en_core_web_sm")
    
    # Load emotion classification model
    emotion_classifier = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        device=0 if torch.cuda.is_available() else -1
    )
    
    # Load sentiment analysis
    sentiment_analyzer = pipeline(
        "sentiment-analysis",
        model="cardiffnlp/twitter-roberta-base-sentiment-latest",
        device=0 if torch.cuda.is_available() else -1
    )
    
    # Load summarization model
    summarizer = pipeline(
        "summarization",
        model="facebook/bart-large-cnn",
        device=0 if torch.cuda.is_available() else -1
    )
    
    logger.info("All NLP models loaded successfully")
    
except Exception as e:
    logger.error(f"Error loading NLP models: {e}")
    # Fallback to basic processing if models fail to load
    nlp = None
    emotion_classifier = None
    sentiment_analyzer = None
    summarizer = None

class DreamAnalyzer:
    def __init__(self):
        self.emotion_colors = {
            'joy': '#F59E0B',
            'sadness': '#3B82F6', 
            'anger': '#EF4444',
            'fear': '#8B5CF6',
            'surprise': '#10B981',
            'disgust': '#84CC16',
            'love': '#EC4899',
            'optimism': '#F97316',
            'pessimism': '#6B7280',
            'trust': '#06B6D4',
            'anticipation': '#A855F7'
        }
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords using spaCy NLP"""
        if not nlp:
            # Fallback keyword extraction
            words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
            return list(set(words))[:10]
        
        doc = nlp(text)
        keywords = []
        
        # Extract named entities
        for ent in doc.ents:
            if ent.label_ in ['PERSON', 'PLACE', 'EVENT', 'WORK_OF_ART']:
                keywords.append(ent.text.lower())
        
        # Extract important nouns and adjectives
        for token in doc:
            if (token.pos_ in ['NOUN', 'ADJ'] and 
                not token.is_stop and 
                not token.is_punct and 
                len(token.text) > 2):
                keywords.append(token.lemma_.lower())
        
        # Remove duplicates and limit to top 10
        return list(set(keywords))[:10]
    
    def analyze_emotions(self, text: str) -> List[Dict]:
        """Analyze emotions in the text"""
        if not emotion_classifier:
            # Fallback emotion analysis
            return [
                {"emotion": "neutral", "intensity": 50, "color": "#6B7280"}
            ]
        
        try:
            results = emotion_classifier(text)
            emotions = []
            
            for result in results[:5]:  # Top 5 emotions
                emotion = result['label'].lower()
                intensity = int(result['score'] * 100)
                color = self.emotion_colors.get(emotion, '#6B7280')
                
                emotions.append({
                    "emotion": emotion,
                    "intensity": intensity,
                    "color": color
                })
            
            return emotions
            
        except Exception as e:
            logger.error(f"Emotion analysis error: {e}")
            return [{"emotion": "neutral", "intensity": 50, "color": "#6B7280"}]
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze overall sentiment"""
        if not sentiment_analyzer:
            return {"sentiment": "neutral", "confidence": 0.5}
        
        try:
            result = sentiment_analyzer(text)[0]
            return {
                "sentiment": result['label'].lower(),
                "confidence": result['score']
            }
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {"sentiment": "neutral", "confidence": 0.5}
    
    def extract_themes(self, text: str, keywords: List[str]) -> List[str]:
        """Extract thematic elements from the dream"""
        themes = []
        
        # Define theme patterns
        theme_patterns = {
            'Flying/Freedom': ['fly', 'flying', 'soar', 'wings', 'air', 'sky', 'freedom'],
            'Water/Emotions': ['water', 'ocean', 'river', 'swimming', 'drowning', 'waves'],
            'Chase/Anxiety': ['chase', 'running', 'escape', 'hide', 'fear', 'pursuit'],
            'Death/Transformation': ['death', 'dying', 'funeral', 'grave', 'transformation'],
            'Animals': ['dog', 'cat', 'bird', 'snake', 'lion', 'animal', 'pet'],
            'Family/Relationships': ['mother', 'father', 'family', 'friend', 'love', 'relationship'],
            'School/Work': ['school', 'teacher', 'work', 'office', 'boss', 'exam', 'test'],
            'House/Security': ['house', 'home', 'room', 'door', 'window', 'building'],
            'Travel/Adventure': ['travel', 'journey', 'adventure', 'explore', 'discover'],
            'Supernatural': ['ghost', 'magic', 'supernatural', 'mystical', 'spiritual']
        }
        
        text_lower = text.lower()
        for theme, pattern_words in theme_patterns.items():
            if any(word in text_lower or word in keywords for word in pattern_words):
                themes.append(theme)
        
        return themes[:5]  # Limit to top 5 themes
    
    def generate_summary(self, text: str) -> str:
        """Generate a psychological summary of the dream"""
        if not summarizer or len(text) < 100:
            # Fallback summary generation
            return f"This dream reflects subconscious thoughts and emotions. The imagery suggests themes of personal growth and inner exploration."
        
        try:
            # Truncate text if too long for the model
            max_length = 1024
            if len(text) > max_length:
                text = text[:max_length]
            
            summary = summarizer(text, max_length=150, min_length=50, do_sample=False)
            return summary[0]['summary_text']
            
        except Exception as e:
            logger.error(f"Summary generation error: {e}")
            return "This dream contains rich symbolic content that reflects your subconscious mind's processing of daily experiences and deeper psychological themes."
    
    def analyze_symbols(self, text: str) -> List[Dict]:
        """Analyze symbolic elements in the dream"""
        symbols = []
        
        # Common dream symbols and their meanings
        symbol_meanings = {
            'water': 'Emotions, subconscious, cleansing, or life changes',
            'fire': 'Passion, transformation, destruction, or purification',
            'flying': 'Freedom, ambition, escape from limitations',
            'falling': 'Loss of control, insecurity, or fear of failure',
            'animals': 'Instincts, natural desires, or aspects of personality',
            'house': 'Self, psyche, security, or personal space',
            'car': 'Life direction, control, or personal drive',
            'death': 'Transformation, endings, or new beginnings',
            'baby': 'New beginnings, innocence, or potential',
            'mirror': 'Self-reflection, truth, or self-perception'
        }
        
        text_lower = text.lower()
        for symbol, meaning in symbol_meanings.items():
            if symbol in text_lower:
                symbols.append({
                    "symbol": symbol.title(),
                    "meaning": meaning
                })
        
        return symbols[:5]  # Limit to top 5 symbols

# Initialize analyzer
dream_analyzer = DreamAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': {
            'spacy': nlp is not None,
            'emotion_classifier': emotion_classifier is not None,
            'sentiment_analyzer': sentiment_analyzer is not None,
            'summarizer': summarizer is not None
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze_dream():
    try:
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({'error': 'Dream content is required'}), 400
        
        content = data['content']
        title = data.get('title', 'Untitled Dream')
        
        if len(content) < 10:
            return jsonify({'error': 'Dream content too short'}), 400
        
        # Perform comprehensive analysis
        keywords = dream_analyzer.extract_keywords(content)
        emotions = dream_analyzer.analyze_emotions(content)
        sentiment = dream_analyzer.analyze_sentiment(content)
        themes = dream_analyzer.extract_themes(content, keywords)
        summary = dream_analyzer.generate_summary(content)
        symbols = dream_analyzer.analyze_symbols(content)
        
        # Compile analysis results
        analysis = {
            'keywords': keywords,
            'emotions': emotions,
            'sentiment': sentiment,
            'themes': themes,
            'summary': summary,
            'symbols': symbols,
            'psychological_insights': f"This dream reveals important aspects of your subconscious mind. The dominant emotions of {', '.join([e['emotion'] for e in emotions[:2]])} suggest you're processing {themes[0] if themes else 'personal experiences'}.",
            'actionable_advice': "Consider journaling about the emotions and symbols in this dream. They may provide insights into your current life situation and inner desires."
        }
        
        logger.info(f"Dream analysis completed: {len(content)} characters processed")
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'metadata': {
                'processed_at': datetime.now().isoformat(),
                'content_length': len(content),
                'processing_time': 'real-time'
            }
        })
        
    except Exception as e:
        logger.error(f"Dream analysis error: {e}")
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e)
        }), 500

@app.route('/extract-keywords', methods=['POST'])
def extract_keywords_endpoint():
    try:
        data = request.get_json()
        content = data.get('content', '')
        
        if len(content) < 10:
            return jsonify({'error': 'Content too short'}), 400
        
        keywords = dream_analyzer.extract_keywords(content)
        
        return jsonify({
            'success': True,
            'keywords': keywords
        })
        
    except Exception as e:
        logger.error(f"Keyword extraction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-emotions', methods=['POST'])
def analyze_emotions_endpoint():
    try:
        data = request.get_json()
        content = data.get('content', '')
        
        if len(content) < 10:
            return jsonify({'error': 'Content too short'}), 400
        
        emotions = dream_analyzer.analyze_emotions(content)
        
        return jsonify({
            'success': True,
            'emotions': emotions
        })
        
    except Exception as e:
        logger.error(f"Emotion analysis error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
