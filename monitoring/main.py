import aiohttp
import asyncio
from lxml import etree
from io import BytesIO

origin = 'http://10.0.0.110:5000'
device = 'Fanuc-0id-01'
url = f'{origin}/{device}/sample' #?path=//Components//Path//*//*[@name="execution"]'
path='//Components//Linear//*[@name="Xact" or @name="Yact" or @name="Zact"]'

async def fetch(session, url, params):
    async with session.get(url, params=params) as response:
        async for chunk in response.content:
            yield chunk

async def main():
    async with aiohttp.ClientSession() as session:
        params = {'path': path, 'interval': '1000'}
        in_stream = fetch(session, url, params)

        async for line in in_stream:
            print('line', line)



        #async with etree.xmlfile(out_stream) as xf:
        #    async with xf.element('{http://etherx.jabber.org/streams}stream'):
        #         async for el in in_stream:
        #             await xf.write(el)
        #             await xf.flush()

        #xml = etree.fromstring(response.encode('ascii'))
        #for cat in xml.iterfind('.//{urn:mtconnect.org:MTConnectStreams:1.3}ComponentStream'):
        #    f = None
        #    for sub in cat.iterfind('.//{urn:mtconnect.org:MTConnectStreams:1.3}Position'):
        #        try:
        #            f = float(sub.text)
        #        except ValueError:
        #            continue
        #    print('each', cat.get('name'), f)

if __name__ == '__main__':
    asyncio.run(main())
