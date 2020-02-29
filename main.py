from threading import Thread
import cherrypy
import jinja2
import paho.mqtt.client as mqtt
import sqlite3 as sql
import json
from datetime import date, datetime
import os

JINJA_ENVIRONMENT = jinja2.Environment(loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__),'templates')),extensions=['jinja2.ext.autoescape'])
DB = 'locations.db'

   
class WebServer(Thread):
   def run(self):
        cherrypy.quickstart(LocationsWebsite(), '/', config)
        # print(config.setup)
    
    
class LocationsWebsite(object):
   
    @cherrypy.expose
    @cherrypy.tools.gzip()
    def index(self):
        template = JINJA_ENVIRONMENT.get_template('index.html')
        return template.render() #make and serve the webpage

    @cherrypy.expose
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def getTableData(self, data):
        today = date.today().strftime('%Y-%m-%d')
        with sql.connect(DB) as conn:
            cur = conn.cursor()
            cur.execute('SELECT name,longitude,latitude,date,time FROM Location WHERE name = ? AND date = ?', (data,today))
            d = cur.fetchall()
            return {'foo':json.dumps(d)}
        
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def getMapData(self, data):
        today = date.today().strftime('%Y-%m-%d')
        with sql.connect(DB) as conn:
            cur = conn.cursor()
            cur.execute('SELECT longitude,latitude FROM Location WHERE name = ? AND date = ?', (data,today))
            results = cur.fetchall()
            return {'foo':json.dumps(results)}

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def getLatestTableData(self, data):
        today = date.today().strftime('%Y-%m-%d')
        used_data = []
        data_list = []
        with sql.connect(DB) as conn:
            cur = conn.cursor()
            cur.execute('SELECT name,longitude,latitude,date,time FROM Location WHERE date = ?', (today,))
            results = cur.fetchall()
            for data in list(reversed(results)):
                if data[0] not in used_data:
                    data_list.append(data)
                    used_data.append(data[0])
            return {'foo': json.dumps(data_list)}


def database_poll():
    client = mqtt.Client()                                                  #bind all functions to mqtt class
    client.on_connect = on_connect
    client.on_message = on_message
    client.username_pw_set("4009user", "mqttBROKER")                        #associate authentication details with the client
    client.tls_set("mqtt.coventry.ac.uk.crt")                               #certificate for client. needs to be in the same directory as this script
    client.connect("mqtt.coventry.ac.uk", 8883)   
    client.loop_forever()
      

 



def on_connect(client, userdata, flags, rc):                            #client method to connect
    """ callback function for connection """    
    if rc == 0:
        client.connected_flag = True                                    #set flag
        print("connected OK")                                           #let us know we connected to the broker
        client.subscribe("owntracks/4009user/#")                        #we are connected, so subscribe to the topic. wildcard means any device
    else:
        print("Bad connection. Returned code = ", rc)                      #if we can't connect

""" callback function for messages received """
def on_message(client, userdata, msg ):                                #client method to get messages from topic
    con = sql.connect('locations.db')                                   #name of the database. You might want to change it.
    cur = con.cursor()
    try:
        cur.execute("CREATE TABLE Location(longitude NUMBER(10,6), latitude NUMBER(10,6), date VARCHAR2(20), time VARCHAR2(20), name VARCHAR2(20));")

    except:
        pass                                                            #if it already exists
    data = json.loads(msg.payload.decode("utf8"))                       #decode message
    day = date.today()                                                  #time functions
    clock = datetime.now()
    time = datetime.time(clock)
    cur.execute("INSERT INTO Location values(?,?,?,?,?);", (round(data["lon"],4), round(data["lat"],4), str(day), str(time), data["tid"]))
                   
    con.commit()
    cur.close()
    con.close()
    

    
config = {
  'global' : {
    'server.socket_host' : '0.0.0.0',
    'server.socket_port' : 5003,
    'server.thread_pool' : 8,
      'tools.gzip.on': True
  },
  '/static': {
               'tools.staticdir.on': True,
               'tools.staticdir.dir': os.path.dirname(os.path.realpath(__file__)) + '/public'
           }
}
print(os.path.dirname(os.path.realpath(__file__)))

datapoll = Thread (target = database_poll )
webserver = WebServer()
webserver.start()
datapoll.run()


