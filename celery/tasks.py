from celery import Celery

broker_url = 'pyamqp://guest@localhost//'
app = Celery('tasks')
app.config_from_object('celeryconfig')

@app.task
def add(x, y):
    return x + y

if __name__ == '__main__':
    print(app)
    app.start()
