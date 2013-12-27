drop table if exists entries;

create table usuario (
  id integer primary key autoincrement,
  name text not null,
  user text not null unique,
  pass_salt text not null,
  foto_user text null
);

create table user_salt (
  id integer primary key autoincrement,
  user text not null unique,
  salt text not null
);

create table log_cancion (  
  usuario text not null,
  nombre_cancion text not null,
  fecha_log datetime not null  
);

create table cancion (
	id integer primary key autoincrement,
	nombre text not null unique,
	url text not null
);


insert into usuario (name, user, pass_salt) values ("Rodrigo", "rih", "asdf1234");
insert into user_salt (user, salt) values ("rih", "123");
insert into cancion (nombre, url) values ("blue", "youtube.com/watch?v=1234");
