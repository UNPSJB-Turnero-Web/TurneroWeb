## Laboratorio de Programación y Lenguajes

### Departamento de Informática - FI-UNPSJB-PM

## Instalación y configuración del entorno de desarrollo

> ESTE LABORATORIO ESTÁ PREPARADO Y PROBADO PARA SER DESARROLLADO SOBRE SISTEMAS **LINUX**, ES REQUERIMIENTO DE LA ASIGNATURA FAMILIARIZARSE CON EL MISMO.
>
> Quien no cuente con el mismo en sus máquinas la cátedra sugiere dos posibles aproximaciones:
> 1. (Recomendada) Instalar cualquier distro Linux dual-boot.
> 2. Instalar el sistema en una máquina virtual

> En la raíz de este directorio existe el script ´lpl´ para facilitar la ejecución de varios comandos. En el presente instructivo se indicará en cada paso, si corresponde, la opción de ejecución mediante este script. 

## Setup

### Software necesario previamente

1. Instalar [Git](https://git-scm.com/download/linux)

1. Instalar [Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/) y [Docker Compose](https://docs.docker.com/compose/install/)
    > **¡CONFIGURACIÓN IMPORTANTE ANTES DE CONTINUAR!**
    >
    1. No olvidar los pasos de post instalación para ejecutar docker sin priviliegios de `root`.
        ```sh
        sudo groupadd docker
        sudo usermod -aG docker $USER
        ```
        Para hacer efectivos los cambios en los grupos, reiniciar la terminal o ejecutar
        ```sh
        newgrp docker
        ```
    1. *Opcional:* Para que docker no arranque de forma automática al inicio:
        ```sh
        sudo systemctl disable docker.service
        sudo systemctl disable containerd.service
        ```
    1. Crear el archivo `/etc/docker/daemon.json` con el siguiente conenido:
        ```json
        {
          "userns-remap": "TU_NOMBRE_DE_USUARIO"
        }
        ```
    1. Editar los archivos `/etc/subuid` y `/etc/subgid`. Agregar la línea:
        ```
        TU_NOMBRE_DE_USUARIO:1000:65536
        ```

1. Iniciar servicio docker `sudo systemctl start docker`
    > Este comando puede variar según la distro de linux utilizada.

1. Instalar [Postman](https://www.postman.com/downloads/) y [DBeaver](https://dbeaver.io/download/)

1. Instalar un editor de texto para escribir el código, se recomienda [VS Code](https://code.visualstudio.com/download).

### Configuración de usuario de Gitlab

1. Genera una clave pública y agregarla al repo desde settings/ssh keys en Gitlab. Seguir este [instructivo](https://git.fi.mdn.unp.edu.ar/help/ssh/README#generating-a-new-ssh-key-pair)

### Obtener el código para trabajar

1. Realizar el **Fork** y dirigirse al repositorio nuevo.

1. Desde la línea de comandos, clonar este repositorio con la url ssh. 
    ```sh
    git clone ssh://git@git.fi.mdn.unp.edu.ar:30000/<repo>`
    ```

1. Ir al directorio clonado `cd <repo_dir>`

1. Dar permisos de ejecución al script `lpl`: `chmod +x lpl`.

1. Hacer el build de las imágenes Docker `./lpl build` 

1. Levantar los servidores `./lpl up`
      > Este paso toma un tiempo debido a que debe descargar las dependencias del proyecto. Para monitorear el progreso utilizar `./lpl logs`.
      >
      > Cuando la aplicación esté lista se verá el mensaje:
      >
      > `backend | [...] Started BackendApplication in xxx seconds`

1. Verificar funcionamiento ingresando a http://localhost:8080/ . Si todo funciona correctamente debería responder el siguiente JSON:
      ```json
      {
      "data": "Hello Labprog!",
      "message": "Server Online",
      "status": 200
      }
      ```
1. Crear el proyecto Angular en el front:
    ```sh
    $ ./lpl sh frontend
    [frontend:node]$ ng new cli --minimal -S -g --defaults 
    ```

1. Detener los servidores `./lpl down`

1. Descomentar linea indicadas en `docker-compose.yml`.

1. Levantar los servidores `./lpl up`

1. Verificar funcionamiento ingresando a http://localhost:4200/ .

Aquí finaliza la instalación y configuración del ambiente de desarrollo, a continuación se detallan los pasos para comenzar con el desarrollo.

## Desarrollar con Docker

Para los siguientes pasos asegurarse de que el servicio de Docker esté corriendo, se puede ejecutar el comando `docker ps`.

El script `lpl` en la raíz del repositorio tiene una serie de comandos útiles abreviados para asistir en el proceso de desarrollo.

### Conectarse a los servidores por línea de comandos

Para conectarse al servidor **backend**, una vez corriendo los servicios, ejecutar: ```./lpl sh backend```

De la misma forma es posible conectarse a cualquiera de los contenedores solo indicando el nombre del mismo.

### Detener los servicios

Para detener los servicios configurados en el archivo de docker-compose ejecutar: ```./lpl down```

El siguiente comando es para detener por completo el servicio de docker. En este caso, si los servicios están corriendo se detendrán y cuando docker sea iniciado nuevamente, estos contenedores serán levantados de forma automática.

`sudo systemctl stop docker`

## Desarrollar en Java en el backend

El servidor de backend despliga automáticamente el código compilado. Luego de modificar los archivos locales se debe ejecutar el siguiente comando:

1. `./lpl compile`

Esto compilará el código en el servidor. Si no hay errores de compilación se desplegará al instante.

En ciertas ocaciones, debido a algún error de compilación que haya sido corregido, es posible que el backend no vuelva a desplegar la aplicación. En este caso, sólo es necesario reiniciar el backend.

1. `./lpl restart backend`

## Staging de datos

> PENDIENTE

## Stack tecnológico
Además de cumplir con los requerimientos funcionales planteados en cada TP, el desarrollo de la aplicación deberá garantizar las siguientes premisas:
* Usar JPA como método de persistencia del modelo de datos. Para las consultas a la base de datos se deberá utilizar JPQL.
* Diseñar la aplicación utilizando los principios de los patrones de Separación en capas &rarr; Layered y N-Tiers.
* La aplicación deberá garantizar transacciones ACID. Especialmente para los procesos.
* Siempre que se pueda y deba, garantizar los principios SOLID de la programación Orientada a Objetos. (SRP, OCP, LSP, ISP, DIP).
* El stack tecnológico requerido para la solución contempla el uso de:
  + **Git** para el control de versiones y distribución del código.
  + **Docker** para la administración de la virtualización en contenedores de los servidores.
  + **Docker compose** pra la coordinación de multiples contenedores.
  + **Angular**  para el desarrollo de la aplicación frontend en javascript.
  + **Spring Boot** para el desarrollo de la aplicación backend en java.
  + **JPA** como ORM para la implementación del modelo.
  + **Postgres** cómo motor de base de datos.
  + **Cucumber-js** para el testing de los servicios REST.
* La gestión de tablas se realizará exclusivamente desde el modelo provisto a continuación y generado desde el ORM. **No se permite ingeniería inversa desde la DB.**

## Forma de entrega
* El trabajo será realizado en forma individual. Se podrá trabajar colaborativamente con otros compañeros.
* El trabajo práctico deberá ser entregado de la siguiente forma:
  * Todo el sitema completo debe ser entrega mediante el proyecto en Git.
  * Bitacora del desarrollo que incluya: Toma de decisiones de la arquitectura de la solución, restricciones de uso y relato del detalle de la evolución del desarrollo. En formato Wiki o Markdown. Este informe debería ser evolutivo en el transcurso del desarrollo del TP.
  * Toda la bibliografía utilizada deberá ser referenciada indicando título y autor, en una sección dedicada a tal efecto.
  * El diseño con el que se aborda la solución al problema planteado. En el caso de utilizar patrones, cuales de ellos utilizó y en qué contexto.
  * El programa de aplicación que implementa la solución mediante el cumplimiento efectivo de los test planteados en las features de BDD.
  * El código fuente debe estar sincronizado en git todo el tiempo para que la cátedra acceda al mismo y pueda verificar permanenetente los avances.

## Forma de aprobación
Se tendrá en cuenta para la aprobación del trabajo práctico y los integrantes del grupo:
1. Planificación del desarrollo de la aplicación. Cumplimiento de las etapas previstas.
2. Funcionamiento de la aplicación desarrollada. Se evaluará si la funcionalidad cumple con lo solicitado, en función de test de Criterios de Aceptación escritos en las features BDD.
3. Estructura general de la presentación, su legibilidad y facilidad de lectura y comprensión.
4. Contenido del informe y el uso de la información técnica para elaborarlo.





