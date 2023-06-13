from flask import Flask, render_template

app = Flask(__name__, template_folder="templates")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analytics")
def analytics():
    return render_template("analytics.html")


@app.route("/manual")
def manual():
    return render_template("manual.html")


if __name__ == "__main__":
    app.run(debug=True)
