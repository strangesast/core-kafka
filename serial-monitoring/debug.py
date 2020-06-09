import asyncio


async def task():
    reader, writer = await asyncio.open_connection(
        '10.0.0.101', 7880)

    message = '* PING'
    writer.write(message.encode())
    await writer.drain()

    try:
        async for data in reader:
            print(f'Received: {data.decode()}')
    except Exception as e:
        print('e', e)
    finally:
        print('Close the connection')
        writer.close()
        await writer.wait_closed()


async def main():
    t = asyncio.create_task(task())
    await t


if __name__  == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
