# -*- encoding: utf-8 -*-

import os
from core import app, db

@app.shell_context_processor
def make_shell_context():
    return {"app": app, "db": db}

# python3 app.py
if __name__ == '__main__':
    # !!! For production: Waitress server
    # from waitress import serve
    # serve(app, host="0.0.0.0", port=os.getenv('PORT', 8000))
    
    # !!! For development: Flask server
    app.run(debug=True, host="0.0.0.0", port=os.getenv('PORT', 2225))
