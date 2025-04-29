package unpsjb.labprog.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

public class Response {

public static ResponseEntity<Object> response(HttpStatus status, String message, Object responseObj) {
System.out.println("DEBUG: response() llamado con status: " + status);
Map<String, Object> map = new HashMap<>();
map.put("status_code", status.value());  // Esto deberÃa ser el codigo real
map.put("status_text", message);
map.put("data", responseObj);

return new ResponseEntity<>(map, HttpStatus.OK); 
}

public static ResponseEntity<Object> ok(Object responseObj) {
return response(HttpStatus.OK, "OK", responseObj);
}

public static ResponseEntity<Object> ok(Object responseObj, String msj) {
return response(HttpStatus.OK, msj, responseObj);
}

    public static ResponseEntity<Object> notFound() {
        return response(HttpStatus.NOT_FOUND, "Not found", null);
    }

public static ResponseEntity<Object> notFound(String msj) {
        return response(HttpStatus.NOT_FOUND, msj, null);
    }

public static ResponseEntity<Object> error(Object responseObj, String msj) {
return response(HttpStatus.BAD_REQUEST, msj, responseObj);
}

public static ResponseEntity<Object> dbError(String msj) {
System.out.println("DEBUG: dbError llamado con mensaje: " + msj);
return response(HttpStatus.CONFLICT, msj, null);
}

}