import requests
from datetime import datetime, timedelta
import time
import matplotlib.pyplot as plt
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

GARLIC_API_URL = "https://ec.europa.eu/agrifood/api/fruitAndVegetable/prices"
OLIVE_OIL_API_URL = "https://ec.europa.eu/agrifood/api/oliveOil/prices"
EGG_API_URL = "https://ec.europa.eu/agrifood/api/poultry/egg/prices"
POWER_TIMESTAMPS_URL = "https://www.smard.de/app/chart_data/4169/DE/index_quarterhour.json"
POWER_API_URL_TEMPLATE = "https://www.smard.de/app/chart_data/4169/DE/4169_DE_hour_{unix}.json"


def get_garlic_price(start=None, end=None, retries=3):
    end_date = datetime.today() if end is None else datetime.strptime(end, '%Y-%m-%d')
    start_date = end_date - \
        timedelta(days=365) if start is None else datetime.strptime(
            start, '%Y-%m-%d')
    params = {
        "memberStateCodes": "EU",
        "products": "garlic",
        "beginDate": start_date.strftime('%d/%m/%Y'),
        "endDate": end_date.strftime('%d/%m/%Y'),
        "varieties": "Ail blanc - Cat. I - Cal. 50-80"
    }
    return fetch_price(GARLIC_API_URL, params, retries)


def get_olive_oil_price(start=None, end=None, retries=3):
    end_date = datetime.today() if end is None else datetime.strptime(end, '%Y-%m-%d')
    start_date = end_date - \
        timedelta(days=365) if start is None else datetime.strptime(
            start, '%Y-%m-%d')
    params = {
        "memberStateCodes": "ES",
        "beginDate": start_date.strftime('%d/%m/%Y'),
        "endDate": end_date.strftime('%d/%m/%Y'),
    }
    return fetch_price(OLIVE_OIL_API_URL, params, retries, product_filter="Extra virgin")


def get_egg_price(start=None, end=None, retries=3):
    end_date = datetime.today() if end is None else datetime.strptime(end, '%Y-%m-%d')
    start_date = end_date - \
        timedelta(days=365) if start is None else datetime.strptime(
            start, '%Y-%m-%d')
    params = {
        "memberStateCodes": "PT,ES",
        "beginDate": start_date.strftime('%d/%m/%Y'),
        "endDate": end_date.strftime('%d/%m/%Y'),
        "farmingMethods": "Barn,Cage"
    }
    return fetch_price(EGG_API_URL, params, retries)


def fetch_price(api_url, params, retries, product_filter=None):
    for attempt in range(retries):
        try:
            response = requests.get(api_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            prices = []
            if isinstance(data, list):
                for item in data:
                    if 'price' in item and (product_filter is None or product_filter in item.get('product', '')):
                        price = float(item['price'].replace(
                            '€', '').replace(',', ''))
                        timestamp = datetime.strptime(
                            item['endDate'], '%d/%m/%Y').timestamp() * 1000
                        prices.append({'timestamp': timestamp, 'price': price})
            else:
                for item in data.get("prices", []):
                    if 'price' in item and (product_filter is None or product_filter in item.get('product', '')):
                        price = float(item['price'].replace(
                            '€', '').replace(',', ''))
                        timestamp = datetime.strptime(
                            item['endDate'], '%d/%m/%Y').timestamp() * 1000
                        prices.append({'timestamp': timestamp, 'price': price})
            if not prices:
                raise ValueError(
                    f"No prices found for {params.get('products', 'specified product')}")
            return prices
        except requests.exceptions.RequestException as e:
            print(
                f"Error fetching price for {params.get('products', 'specified product')}: {e}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(2)
            else:
                return None


def get_power_price(start=None, end=None, retries=3):
    for attempt in range(retries):
        try:
            # Fetch the list of timestamps
            response = requests.get(POWER_TIMESTAMPS_URL, timeout=10)
            response.raise_for_status()
            data = response.json()
            timestamps = data.get('timestamps', [])
            if not timestamps:
                raise ValueError("No timestamps found for power prices")

            # Filter timestamps based on start and end dates
            end_date = datetime.today() if end is None else datetime.strptime(end, '%Y-%m-%d')
            start_date = end_date - \
                timedelta(days=365) if start is None else datetime.strptime(
                    start, '%Y-%m-%d')
            start_timestamp = int(start_date.timestamp() * 1000)
            end_timestamp = int(end_date.timestamp() * 1000)
            timestamps = [
                ts for ts in timestamps if start_timestamp <= ts <= end_timestamp]

            prices = []
            for timestamp in reversed(timestamps):
                print(
                    f"Fetching power price for {datetime.fromtimestamp(timestamp / 1000)}, {timestamp}")
                power_api_url = POWER_API_URL_TEMPLATE.format(unix=timestamp)
                response = requests.get(power_api_url, timeout=10)
                response.raise_for_status()
                data = response.json()
                series = data.get('series', [])
                if series:
                    series = list(filter(lambda x: x[1] is not None, series))
                    for item in series:
                        prices.append({'timestamp': item[0], 'price': item[1]})
            if not prices:
                raise ValueError("No valid power prices found")
            return prices
        except requests.exceptions.RequestException as e:
            print(f"Error fetching power price: {e}")
            if attempt < retries - 1:
                print("Retrying...")
                time.sleep(2)
            else:
                return None


def calculate_historic_aioli_index(start=None, end=None):
    olive_oil_prices = get_olive_oil_price(start=start, end=end)
    eggs_prices = get_egg_price(start=start, end=end)
    garlic_prices = get_garlic_price(start=start, end=end)
    power_prices = get_power_price(start=start, end=end)

    if None in (olive_oil_prices, eggs_prices, garlic_prices, power_prices):
        print("Failed to fetch one or more commodity prices.")
        return None

    # Convert lists to dictionaries for faster lookup
    olive_oil_dict = {item['timestamp']: item['price']
                      for item in olive_oil_prices}
    eggs_dict = {item['timestamp']: item['price'] for item in eggs_prices}
    garlic_dict = {item['timestamp']: item['price'] for item in garlic_prices}
    power_dict = {item['timestamp']: item['price'] for item in power_prices}

    # Combine all timestamps from all price series
    all_timestamps = sorted(set(olive_oil_dict.keys()).union(
        eggs_dict.keys(), garlic_dict.keys(), power_dict.keys()))

    if start:
        start_timestamp = int(datetime.strptime(
            start, '%Y-%m-%d').timestamp() * 1000)
        all_timestamps = [ts for ts in all_timestamps if ts >= start_timestamp]

    if end:
        end_timestamp = int(datetime.strptime(
            end, '%Y-%m-%d').timestamp() * 1000)
        all_timestamps = [ts for ts in all_timestamps if ts <= end_timestamp]

    historic_index = []

    olive_oil_price = None
    eggs_price = None
    garlic_price = None
    power_price = 50

    for timestamp in all_timestamps:
        olive_oil_price = olive_oil_dict.get(timestamp, olive_oil_price)
        eggs_price = eggs_dict.get(timestamp, eggs_price)
        garlic_price = garlic_dict.get(timestamp, garlic_price)
        power_price = power_dict.get(timestamp, power_price)

        if None in (olive_oil_price, eggs_price, garlic_price, power_price):
            continue

        qty_olive_oil = 800  # 80%
        qty_eggs = 50       # 5%
        qty_garlic = 150      # 15%

        cost_olive_oil = (qty_olive_oil / 100) * olive_oil_price
        cost_eggs = (qty_eggs / 100) * eggs_price
        cost_garlic = (qty_garlic / 100) * garlic_price

        energy_cost = 1000 * (power_price / 1000)  # Convert €/MWh to €/kWh

        total_cost = cost_olive_oil + cost_eggs + cost_garlic + energy_cost

        historic_index.append({
            'timestamp': timestamp,
            'index': total_cost,
            'olive_oil_cost': olive_oil_price,
            'eggs_cost': eggs_price,
            'garlic_cost': garlic_price,
            'energy_cost': power_price
        })
        

    return historic_index


def plot_historic_aioli_index(historic_index):
    timestamps = [entry['timestamp'] for entry in historic_index]
    indices = [entry['index'] for entry in historic_index]
    olive_oil_costs = [entry['olive_oil_cost'] for entry in historic_index]
    eggs_costs = [entry['eggs_cost'] for entry in historic_index]
    garlic_costs = [entry['garlic_cost'] for entry in historic_index]
    energy_costs = [entry['energy_cost'] for entry in historic_index]

    # Convert timestamps to datetime objects for plotting
    dates = [datetime.fromtimestamp(ts / 1000) for ts in timestamps]

    plt.figure(figsize=(10, 5))
    plt.plot(dates, indices, label='Aioli Price Index')
    plt.plot(dates, olive_oil_costs, label='Olive Oil Cost')
    plt.plot(dates, eggs_costs, label='Eggs Cost')
    plt.plot(dates, garlic_costs, label='Garlic Cost')
    plt.plot(dates, energy_costs, label='Energy Cost')
    plt.xlabel('Date')
    plt.ylabel('Price Index (€/tonne)')
    plt.title('Historic Aioli Price Index and Components')
    plt.legend()
    plt.grid(True)
    plt.savefig('aioli_index.png')
    plt.show()


def predict_price(historic_index, periods=6):
    # Convert historic_index to DataFrame
    df = pd.DataFrame(historic_index)
    df['date'] = pd.to_datetime(df['timestamp'], unit='ms')
    df.set_index('date', inplace=True)

    # Fit Seasonal ARIMA model for each component
    models = {}
    forecasts = {}

    # Other components exhibit yearly seasonality
    for component in ['olive_oil_cost', 'eggs_cost', 'garlic_cost']:
        print(f"Fitting model for {component}")
        df_subsampled = df[component].resample('W').mean()
        model = SARIMAX(df_subsampled, order=(2, 1, 2), seasonal_order=(1, 1, 0, 52),
                        enforce_stationarity=False,
                        enforce_invertibility=False)
        results = model.fit()
        forecast = results.get_forecast(
            steps=periods*4)  # Assuming 30 days per month
        forecasts[component] = forecast.predicted_mean
        print(f"{component} forecast: {forecasts[component]}")

    # Power prices exhibit daily seasonality
    df_subsampled = df['energy_cost'].resample('h').mean()
    # only use the last mpntj of data for power prices
    df_subsampled = df_subsampled[-1 * 30 * 24:]
    power_model = SARIMAX(df_subsampled, order=(
        2, 0, 2), seasonal_order=(1, 1, 1, 24))
    power_results = power_model.fit()
    power_forecast = power_results.get_forecast(
        steps=periods * 24 * 30)  # Assuming 30 days per month
    forecasts['energy_cost'] = power_forecast.predicted_mean
    print(f"Power forecasted")

    # Add the last sample of each time series to the forecast
    for component in forecasts:
        forecasts[component] = pd.concat([df[component].iloc[-1:],forecasts[component]])

    # Combine forecasts into a single DataFrame
    forecast_df = pd.DataFrame(forecasts)
    # Give the date field a name
    forecast_df.index.name = 'date'


    # Not all components have the same frequency. Fill missing values with the last known value
    forecast_df.ffill(inplace=True)
    # Resample to hourly frequency
    df = df.resample('h').ffill()

    print("Forcast_df", forecast_df)

    # Calculate the total forecasted index
    forecast_df['index'] = (
        (forecast_df['olive_oil_cost'] * 8) +
        (forecast_df['eggs_cost'] * 0.5) +
        (forecast_df['garlic_cost'] * 1.5) +
        (forecast_df['energy_cost'] * (1000 / 1000))  # Convert €/MWh to €/kWh
    )
    
    # Store time series to file
    forecast_df.to_csv('forecast.csv')
    df.to_csv('historic.csv')

    # Plot the forecast
    plt.figure(figsize=(10, 5))
    plt.plot(df.index, df['index'], label='Historic Aioli Price Index')
    plt.plot(df.olive_oil_cost, label='Olive Oil Cost')
    plt.plot(df.eggs_cost, label='Eggs Cost')
    plt.plot(df.garlic_cost, label='Garlic Cost')
    plt.plot(df.energy_cost, label='Energy Cost')

    plt.plot(forecast_df.index, forecast_df['index'],
             label='Forecast Aioli Price Index', linestyle='--')
    plt.plot(forecast_df.olive_oil_cost, label='Forecast Olive Oil Cost')
    plt.plot(forecast_df.eggs_cost, label='Forecast Eggs Cost')
    plt.plot(forecast_df.garlic_cost, label='Forecast Garlic Cost')
    plt.plot(forecast_df.energy_cost, label='Forecast Energy Cost')
    
    nov_5 = pd.Timestamp('2024-11-05')  # Specify the date for the marker
    plt.axvline(nov_5, color='red', linestyle=':', label='Donald J. Trump elected', lw=2)
    
    plt.xlabel('Date')
    plt.ylabel('Price Index (€/tonne)')
    plt.title('Aioli Price Index Forecast')
    plt.legend()
    plt.grid(True)
    plt.savefig('aioli_index_forecast.png')
    plt.show()


def main():
    start_date = '2018-01-01'
    
    # Today
    end_date = datetime.now().strftime('%Y-%m-%d')
    historic_index = calculate_historic_aioli_index(
        start=start_date, end=end_date)
    if historic_index is not None:
        for entry in historic_index:
            print(
                f"Timestamp: {datetime.fromtimestamp(entry['timestamp'] / 1000)}, Index: {entry['index']:.2f} €/tonne")
        # plot_historic_aioli_index(historic_index)
        predict_price(historic_index, periods=6)


if __name__ == '__main__':
    main()