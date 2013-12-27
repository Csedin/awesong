# coding=UTF-8
import hashlib
import random
from functools import wraps
from Cookie import SimpleCookie
from bottle import (get,
                    post,
                    request,
                    Bottle,
                    run,
                    view,
                    template,
                    static_file) # or route

import sqlite3
import bottle

app = bottle.app()
kuki = SimpleCookie()

# logged in
def logged_in(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if kuki and kuki['usuario'] is not None:
            return f(*args, **kwargs)
        else:
            return bottle.redirect('/login')
    return decorated_function

# Static Routes
@get('/<filename:re:.*\.js>')
def javascripts(filename):
    return static_file(filename, root='static/bootstrap/js')

@get('/<filename:re:.*\.css>')
def stylesheets(filename):
    return static_file(filename, root='static/bootstrap/css')

@get('/<filename:re:.*\.(jpg|png|gif|ico)>')
def images(filename):
    return static_file(filename, root='static/img')

@get('/<filename:re:.*\.(eot|ttf|woff|svg)>')
def fonts(filename):
    return static_file(filename, root='static/bootstrap/fonts')

def get_db():
    conn = sqlite3.connect('proyectoWeb.sqlite')
    db = conn.cursor()
    return conn

def crear_salt():
    largo = random.randint(4,12)
    saltito = ""
    for x in range(0,largo):
        car = random.randint(35,126)
        saltito = saltito + chr(car)
    return saltito


def check_login(user,passwd):
    if not user or not passwd:
        return False
    else:
        db = get_db()
        cursor = db.cursor()
        query_SALT = cursor.execute("SELECT salt from user_salt WHERE user = ?",[user])
        result_SALT = query_SALT.fetchall()
        if len(result_SALT) > 0:
            SALT = result_SALT[0]
            hash_pass = hashlib.sha224((passwd + SALT[0]).encode("utf-8")).hexdigest()
            result = cursor.execute("SELECT name, user, pass_salt FROM usuario WHERE user = ? and pass_salt = ? ;",( user, hash_pass) )
            result = cursor.fetchone()
            cursor.close()
            if not result==None:
                if user == result[1] and hash_pass == result[2]:
                    kuki['usuario'] =  user
                    kuki['name'] =  result[0]
                    return True
                else:
                    return False
            else:
                return False
        else:
            return False


@get('/login')
def login():
    return template('views/login.html')

@post('/login')
def do_login():
    username = request.forms.get('username')
    password = request.forms.get('password')
    if check_login(username, password):
        bottle.redirect('/')
    else:
        return template('views/login.html',error='Usuario o contraseña incorrectos.')

@app.route('/logout')
@logged_in
def logout():
    kuki.clear()
    return bottle.redirect('/login')

@get('/registro')
def registro():
    return template('views/registro.html')

@post('/registro')
def do_registro():
    name = request.forms.get("name")
    user = request.forms.get("user")
    password = request.forms.get("pass")
    if not name or not user or not password:
        return template('views/registro.html',error=' ')
    if len(user) < 4:
        return template('views/registro.html',error='Su usuario debe tener por lo menos 4 caracteres.')
    if len(password) < 6:
        return template('views/registro.html',error='Su contraseña debe tener por lo menos 6 caracteres.')
    db = get_db()
    cursor = db.cursor()
    query_user = cursor.execute("SELECT user from usuario WHERE user = ?",[user])
    result_user = query_user.fetchall()
    if len(result_user) > 0:
        return template('views/registro.html',error='El usuario ya existe.')
    SALT = crear_salt()
    hash_pass = hashlib.sha224((password + SALT).encode("utf-8")).hexdigest()
    cursor.execute('insert into user_salt (user, salt) values (?,?) ',
                        [user, SALT])
    db.commit()
    cursor.execute('insert into usuario (name,user, pass_salt) values (?,?,?) ',
                        [name, user, hash_pass])
    db.commit()
    return template('views/login.html',registro=True)

@get('/mysongs')
@logged_in
def mysongs():
    db = get_db()
    cursor = db.cursor()
    query = cursor.execute('SELECT url, nombre_cancion, fecha_log FROM cancion,log_cancion WHERE nombre = nombre_cancion AND usuario = ? GROUP BY fecha_log ORDER BY fecha_log',
                                [kuki['usuario'].value.strip()])
    f = open('myfile','w')
    f.write(kuki['usuario'].value.strip()) # python will convert \n to os.linesep
    f.close() # you can omit in most cases as the destructor will call if
    result = query.fetchall();
    return template('views/mysongs.html',username=kuki['usuario'].value,songs=result);
    
@post('/mysongs')
@logged_in
def add_song():
    data = request.json['data']
    username = data['username'].strip();
    id = data['id']
    nombre = data['nombre']
    db = get_db()
    cursor = db.cursor()
    cursor.execute('insert into cancion values (null,?,?) ',
                        [nombre, "http://www.youtube.com/watch?v="+id])
    db.commit()
    cursor.execute('insert into log_cancion values (?,?,CURRENT_TIMESTAMP) ',
                        [username, nombre])
    db.commit()
    return
    
@app.route('/')
@logged_in
def index():
    return template('views/index.html',username=kuki['usuario'].value)

    
if __name__ == '__main__':
        bottle.debug(True)
        bottle.run(app = app, host='localhost', port=8080)


