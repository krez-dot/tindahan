from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import re

app = Flask(__name__)
CORS(app)

# ── Sentiment Analysis ──────────────────────────────────────────
@app.route('/sentiment', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({ 'error': 'No text provided' }), 400

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # -1 to 1
    subjectivity = blob.sentiment.subjectivity  # 0 to 1

    if polarity > 0.2:
        label = 'positive'
        emoji = '😊'
    elif polarity < -0.2:
        label = 'negative'
        emoji = '😞'
    else:
        label = 'neutral'
        emoji = '😐'

    return jsonify({
        'text': text,
        'polarity': round(polarity, 3),
        'subjectivity': round(subjectivity, 3),
        'label': label,
        'emoji': emoji
    })

# ── Natural Language Search ─────────────────────────────────────
@app.route('/search', methods=['POST'])
def smart_search():
    data = request.get_json()
    query = data.get('query', '').lower()

    if not query:
        return jsonify({ 'error': 'No query provided' }), 400

    # Category keywords mapping
    category_keywords = {
        'Food': ['food', 'eat', 'restaurant', 'karinderya', 'carinderia', 'lutong', 'kain',
                 'lunch', 'dinner', 'breakfast', 'almusal', 'tanghalian', 'hapunan',
                 'ulam', 'rice', 'kanin', 'merienda', 'snack', 'bakery', 'panaderya',
                 'cafe', 'coffee', 'kape', 'bbq', 'barbecue', 'lechon', 'adobo'],
        'Retail': ['shop', 'store', 'tindahan', 'buy', 'sell', 'grocery', 'sari-sari',
                   'ukay', 'clothes', 'damit', 'shoes', 'sapatos', 'market', 'palengke',
                   'hardware', 'supplies', 'goods', 'retail'],
        'Services': ['service', 'repair', 'fix', 'ayos', 'salon', 'barber', 'gupit',
                     'laundry', 'wash', 'printing', 'print', 'xerox', 'internet', 'wifi',
                     'mechanic', 'plumber', 'electrician', 'delivery', 'hatid'],
        'Health': ['pharmacy', 'botika', 'medicine', 'gamot', 'clinic', 'doctor', 'health',
                   'hospital', 'dental', 'ngipin', 'optical', 'mata', 'medical'],
        'Education': ['school', 'tutorial', 'tutor', 'review', 'lessons', 'class',
                      'training', 'course', 'learn', 'aral'],
    }

    # Detect categories from query
    detected_categories = []
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in query:
                if category not in detected_categories:
                    detected_categories.append(category)
                break

    # Extract location hints
    location_hints = []
    tarlac_barangays = ['tibag', 'central', 'ligtasan', 'maliwalo', 'santo cristo',
                        'san juan', 'salapungan', 'romulo', 'amucao', 'cut-cut']
    for barangay in tarlac_barangays:
        if barangay in query:
            location_hints.append(barangay)

    # Price hints
    price_hints = None
    if any(word in query for word in ['cheap', 'mura', 'affordable', 'budget', 'sulit']):
        price_hints = 'budget'
    elif any(word in query for word in ['mahal', 'premium', 'luxury', 'high-end']):
        price_hints = 'premium'

    # Clean search terms (remove common words)
    stop_words = ['find', 'near', 'around', 'looking', 'for', 'a', 'an', 'the',
                  'where', 'can', 'i', 'get', 'some', 'any', 'good', 'best', 'sa',
                  'ng', 'na', 'ang', 'mga', 'yung', 'dito', 'dto', 'need', 'want']
    words = query.split()
    search_terms = [w for w in words if w not in stop_words and len(w) > 2]

    return jsonify({
        'original_query': data.get('query'),
        'search_terms': search_terms,
        'detected_categories': detected_categories,
        'location_hints': location_hints,
        'price_hints': price_hints,
        'suggested_search': ' '.join(search_terms)
    })

# ── Photo Tag Classification ────────────────────────────────────
@app.route('/classify', methods=['POST'])
def classify_text():
    data = request.get_json()
    text = data.get('text', '').lower()

    tags = []

    food_words = ['food', 'eat', 'meal', 'dish', 'rice', 'menu', 'cook', 'kitchen',
                  'restaurant', 'cafe', 'breakfast', 'lunch', 'dinner', 'snack']
    service_words = ['repair', 'service', 'fix', 'install', 'clean', 'deliver', 'print']
    retail_words = ['shop', 'store', 'sell', 'buy', 'product', 'item', 'goods', 'stock']
    health_words = ['medicine', 'health', 'medical', 'clinic', 'pharmacy', 'doctor']

    if any(w in text for w in food_words): tags.append('food')
    if any(w in text for w in service_words): tags.append('service')
    if any(w in text for w in retail_words): tags.append('retail')
    if any(w in text for w in health_words): tags.append('health')
    if not tags: tags.append('general')

    return jsonify({ 'text': text, 'tags': tags })

# ── Health check ────────────────────────────────────────────────
@app.route('/', methods=['GET'])
def health():
    return jsonify({ 'status': 'ok', 'message': 'Tindahan AI service running 🤖' })

if __name__ == '__main__':
    app.run(port=5001, debug=True)