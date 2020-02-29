setup = {
  'global' : {
    'server.socket_host' : '0.0.0.0',
    'server.socket_port' : 5005,
    'server.thread_pool' : 8,
      'tools.gzip.on': True
  },
  '/static': {
               'tools.staticdir.on': True,
               'tools.staticdir.dir': '/home/boggy/PycharmProjects/CEM/location-tracker-4009CEM/public'
           }
}

