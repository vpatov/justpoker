#!/usr/bin/env python

import asyncio
import websockets
import requests


r = requests.get('http://localhost:8080')
assert(r.status_code == 200)

queryParams = {
    'bigBlind': 3,
    'smallBlind': 1,
    'gameType': 'NLHOLDEM',
    'password': 'abc'
}
r = requests.get('http://localhost:8080/newgameget', params=queryParams)
print(r.text)


async def initWS():
    uri = "ws://localhost:8080"
    async with websockets.connect(uri) as websocket:
        name = input("What's your name? ")

        await websocket.send(name)
        print(f"> {name}")

        greeting = await websocket.recv()
        print(f"< {greeting}")

asyncio.get_event_loop().run_until_complete(initWS())
