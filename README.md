# location-tracker-4009CEM

The mqtt.coventry.ac.uk.crt is inside .gitignore which means that git will not add it to the repository. You need to manually download it from codio and add it to your folder.
When you git push origin master, git will ignore the certificate because it's inside .gitignore


Inside main.py modify the line below to reflect your local computer path. This is a quick workaround will fix later.

#tools.staticdir.dir': '/home/codio/workspace/project/public'
               for example this is my path
               /home/boggy/PycharmProjects/location-tracker-4009CEM/public
