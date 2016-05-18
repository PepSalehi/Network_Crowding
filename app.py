from flask import Flask
from flask import render_template
# from pymongo import MongoClient
import json


app = Flask(__name__)



@app.route("/")
def index():
    return render_template("index.html")



if __name__ == "__main__":
    app.run(debug=True, use_reloader=True)