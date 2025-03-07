import schedule
import time
import threading
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os
from src.calculate import main as calculate_main

app = Flask(__name__, static_folder='../website')
# Enable CORS for all routes under /api/*
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global variables to store the data
historic_data = None
forecast_data = None

def load_data():
    global historic_data, forecast_data
    historic_data = pd.read_csv('historic.csv', parse_dates=['date'])
    forecast_data = pd.read_csv('forecast.csv', parse_dates=['date'])

def scheduled_task():
    calculate_main()
    load_data()

# Schedule the task to run every hour
schedule.every().hour.do(scheduled_task)

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

# Start the scheduler in a separate thread
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.daemon = True
scheduler_thread.start()

# Load data initially
load_data()

def filter_and_resample(data, start_date, end_date, frequency):

    # Ensure start_date and end_date are timezone-naive
    start_date = start_date.tz_localize(None)
    end_date = end_date.tz_localize(None)

    # Filter data by date range
    filtered_data = data[(data['date'] >= start_date)
                         & (data['date'] <= end_date)]

    # Resample data by frequency
    resampled_data = filtered_data.resample(
        frequency, on='date').mean().reset_index()

    return resampled_data


@app.route('/api/historic', methods=['GET'])
def get_historic_data():
    start_date = request.args.get('start_date', default='2018-01-06', type=str)
    end_date = request.args.get(
        'end_date', default=datetime.now().strftime('%Y-%m-%d'), type=str)
    frequency = request.args.get('frequency', default='D', type=str)

    start_date = pd.to_datetime(start_date)
    end_date = pd.to_datetime(end_date)

    filtered_data = filter_and_resample(
        historic_data, start_date, end_date, frequency)

    response = jsonify(filtered_data.to_dict(orient='records'))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/api/forecast', methods=['GET'])
def get_forecast_data():
    start_date = request.args.get(
        'start_date', default=datetime.now().strftime('%Y-%m-%d'), type=str)
    end_date = request.args.get('end_date', default='2025-12-31', type=str)
    frequency = request.args.get('frequency', default='H', type=str)

    start_date = pd.to_datetime(start_date)
    end_date = pd.to_datetime(end_date)

    filtered_data = filter_and_resample(
        forecast_data, start_date, end_date, frequency)

    response = jsonify(filtered_data.to_dict(orient='records'))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/api/cards', methods=['GET'])
def get_card_data():
    end_date = datetime.now()
    start_date = end_date - pd.DateOffset(months=1)

    # Last historic value
    latest_historic_value = historic_data.iloc[-1]
    # One month old historic value
    previous_historic_value = historic_data[historic_data['date']
                                            > start_date].iloc[0]

    # Last forecast value
    latest_forecast_value = forecast_data.iloc[-1]

    current_index = latest_historic_value['index']
    monthly_change_abs = latest_historic_value['index'] - \
        previous_historic_value['index']
    monthly_change_rel = (
        (latest_historic_value['index'] - previous_historic_value['index']) / previous_historic_value['index']) * 100
    price_target = latest_forecast_value['index']

    card_data = {
        'current_index': current_index,
        'monthly_change_abs': monthly_change_abs,
        'monthly_change_rel': monthly_change_rel,
        'price_target': price_target
    }

    response = jsonify(card_data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    app.run(debug=True)
