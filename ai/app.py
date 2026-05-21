from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
from groq import Groq
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"])

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY")) if os.environ.get("GROQ_API_KEY") else None

# ── Fallback keyword matcher (used if Groq is unavailable) ─────────
CATEGORY_KEYWORDS = {
    'Food': ['food', 'eat', 'restaurant', 'karinderya', 'carinderia', 'lutong', 'kain',
             'lunch', 'dinner', 'breakfast', 'almusal', 'tanghalian', 'hapunan',
             'ulam', 'rice', 'kanin', 'merienda', 'snack', 'bakery', 'panaderya',
             'cafe', 'coffee', 'kape', 'bbq', 'barbecue', 'lechon', 'adobo',
             'pagkain', 'masarap', 'sarap', 'lutuin', 'ihaw', 'nilaga', 'sinigang'],
    'Retail': ['shop', 'store', 'tindahan', 'buy', 'sell', 'grocery', 'sari-sari',
               'ukay', 'clothes', 'damit', 'shoes', 'sapatos', 'market', 'palengke',
               'hardware', 'supplies', 'goods', 'retail', 'bilhin', 'pabili', 'pamili',
               'supermarket', 'tiangge'],
    'Services': ['service', 'repair', 'fix', 'ayos', 'salon', 'barber', 'gupit',
                 'laundry', 'wash', 'printing', 'print', 'xerox', 'internet', 'wifi',
                 'mechanic', 'plumber', 'electrician', 'delivery', 'hatid', 'serbisyo',
                 'ayusin', 'kumpunihin', 'parlor', 'spa'],
    'Health': ['pharmacy', 'botika', 'medicine', 'gamot', 'clinic', 'doctor', 'health',
               'hospital', 'dental', 'ngipin', 'optical', 'mata', 'medical', 'ospital',
               'doktor', 'manggagamot', 'vitamins', 'drugstore'],
    'Education': ['school', 'tutorial', 'tutor', 'review', 'lessons', 'class',
                  'training', 'course', 'learn', 'aral', 'paaralan', 'guro',
                  'review center', 'daycare'],
}

STOP_WORDS = {
    'find', 'near', 'around', 'looking', 'for', 'a', 'an', 'the',
    'where', 'can', 'i', 'get', 'some', 'any', 'good', 'best',
    'sa', 'ng', 'na', 'ang', 'mga', 'yung', 'dito', 'dto',
    'need', 'want', 'saan', 'ano', 'may', 'meron', 'hanapin',
    'gusto', 'ko', 'mo', 'namin', 'nila', 'po', 'ho', 'ba',
    'is', 'there', 'any', 'do', 'you', 'have',
}

TARLAC_BARANGAYS = [
    'tibag', 'central', 'ligtasan', 'maliwalo', 'santo cristo',
    'san juan', 'salapungan', 'romulo', 'amucao', 'cut-cut',
    'binauganan', 'matatalaib', 'dolores', 'san miguel', 'poblacion',
]

def keyword_search(query):
    q = query.lower()
    detected_categories = []
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            detected_categories.append(category)

    location_hints = [b for b in TARLAC_BARANGAYS if b in q]

    price_hints = None
    if any(w in q for w in ['cheap', 'mura', 'affordable', 'budget', 'sulit', 'tipid']):
        price_hints = 'budget'
    elif any(w in q for w in ['mahal', 'premium', 'luxury', 'high-end']):
        price_hints = 'premium'

    words = q.split()
    search_terms = [w for w in words if w not in STOP_WORDS and len(w) > 2]

    return {
        'original_query': query,
        'search_terms': search_terms,
        'detected_categories': detected_categories,
        'location_hints': location_hints,
        'price_hints': price_hints,
        'suggested_search': ' '.join(search_terms),
        'source': 'keyword',
    }

def groq_search(query):
    prompt = f"""You are a search assistant for Tindahan, a local business directory in Tarlac City, Philippines.
Users search in English, Tagalog, or Taglish (mixed).

Tagalog vocabulary hints:
- Food: kain/makakain/kumain/pagkain/lutuin/masarap/ulam/kanin/merienda/almusal/tanghalian/hapunan/ihaw/karinderya/carinderia/lutong
- Retail: bili/pabili/pamimili/tindahan/palengke/ukay/damit/sapatos/sari-sari
- Services: ayos/ayusin/kumpunihin/gupit/salon/parlor/laundry/hatid/serbisyo/xerox
- Health: gamot/botika/doktor/ospital/ngipin/mata/medikal
- Education: aral/paaralan/guro/tutor/kurso

Categories available: Food, Retail, Services, Health, Education

Return a JSON object with:
- detected_categories: array of matching categories (can be multiple). Empty array if none.
- search_terms: key meaningful words only (no filler). Max 5.
- location_hints: actual barangay names only (tibag, central, maliwalo, ligtasan, amucao, binauganan, cut-cut, salapungan, etc). Words like "dito", "malapit", "lugar", "lugar" are NOT barangays — ignore them. Empty array if none.
- price_hints: "budget" if cheap/mura/sulit/tipid/affordable, "premium" if mahal/luxury/high-end, null otherwise.
- suggested_search: clean English rephrasing (short phrase).

Examples:
"saan makakain ng mura" → {{"detected_categories": ["Food"], "search_terms": ["makakain"], "location_hints": [], "price_hints": "budget", "suggested_search": "affordable food"}}
"may botika ba sa tibag" → {{"detected_categories": ["Health"], "search_terms": ["botika"], "location_hints": ["tibag"], "price_hints": null, "suggested_search": "pharmacy in tibag"}}
"gusto ko ng damit pang-school" → {{"detected_categories": ["Retail", "Education"], "search_terms": ["damit", "school"], "location_hints": [], "price_hints": null, "suggested_search": "school clothes"}}

Query: "{query}"

Respond with ONLY valid JSON, no explanation."""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=200,
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    result = json.loads(raw)

    valid_barangays = {b.lower() for b in TARLAC_BARANGAYS}
    raw_hints = [h.lower() for h in result.get('location_hints', [])]
    filtered_hints = [h for h in raw_hints if h in valid_barangays]

    return {
        'original_query': query,
        'search_terms': result.get('search_terms', []),
        'detected_categories': result.get('detected_categories', []),
        'location_hints': filtered_hints,
        'price_hints': result.get('price_hints', None),
        'suggested_search': result.get('suggested_search', query),
        'source': 'groq',
    }

# ── Sentiment Analysis ──────────────────────────────────────────
@app.route('/sentiment', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    if polarity > 0.2:
        label, emoji = 'positive', '😊'
    elif polarity < -0.2:
        label, emoji = 'negative', '😞'
    else:
        label, emoji = 'neutral', '😐'

    return jsonify({
        'text': text,
        'polarity': round(polarity, 3),
        'subjectivity': round(blob.sentiment.subjectivity, 3),
        'label': label,
        'emoji': emoji,
    })

# ── Natural Language Search ─────────────────────────────────────
@app.route('/search', methods=['POST'])
def smart_search():
    data = request.get_json()
    query = data.get('query', '').strip()
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    if groq_client:
        try:
            return jsonify(groq_search(query))
        except Exception as e:
            # Groq failed (rate limit, network, bad JSON) — fall back silently
            print(f"Groq fallback: {e}")

    return jsonify(keyword_search(query))

# ── Photo Tag Classification ────────────────────────────────────
@app.route('/classify', methods=['POST'])
def classify_text():
    data = request.get_json()
    text = data.get('text', '').lower()
    tags = []
    if any(w in text for w in ['food', 'eat', 'meal', 'dish', 'rice', 'menu', 'cook', 'kitchen', 'restaurant', 'cafe']):
        tags.append('food')
    if any(w in text for w in ['repair', 'service', 'fix', 'install', 'clean', 'deliver', 'print']):
        tags.append('service')
    if any(w in text for w in ['shop', 'store', 'sell', 'buy', 'product', 'item', 'goods', 'stock']):
        tags.append('retail')
    if any(w in text for w in ['medicine', 'health', 'medical', 'clinic', 'pharmacy', 'doctor']):
        tags.append('health')
    if not tags:
        tags.append('general')
    return jsonify({'text': text, 'tags': tags})

# ── Health check ────────────────────────────────────────────────
@app.route('/', methods=['GET'])
def health():
    source = 'groq' if groq_client else 'keyword-fallback'
    return jsonify({'status': 'ok', 'message': 'Tindahan AI service running 🤖', 'ai_source': source})

if __name__ == '__main__':
    app.run(port=5001, debug=False)
