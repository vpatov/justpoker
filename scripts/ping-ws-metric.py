import os
import requests
import json
import time
import datetime


timestamp = datetime.datetime.now()
r = requests.get('https://justpoker.games/metrics')
response = json.loads(r.content)

#columns are date, gameInstancesCount, totalWSCount
with open('time-series.csv','a') as f:
    f.write('{},{},{}\n'.format(timestamp, response['gameInstancesCount'], response['totalWSCount']))
