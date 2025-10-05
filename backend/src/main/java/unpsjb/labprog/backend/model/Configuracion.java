package unpsjb.labprog.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@Entity
public class Configuracion {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(unique = true, nullable = false)
    private String clave;

    private Integer valorInt;
    private String valorString;
    private Boolean valorBoolean;
    private Double valorDouble;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false)
    private String tipoValor; // "INTEGER", "STRING", "BOOLEAN", "DOUBLE"

    private String categoria; // Para agrupar configuraciones: "TURNOS", "NOTIFICACIONES", etc.

    public Configuracion(String clave, Integer valorInt, String descripcion, String categoria) {
        this.clave = clave;
        this.valorInt = valorInt;
        this.descripcion = descripcion;
        this.tipoValor = "INTEGER";
        this.categoria = categoria;
    }

    public Configuracion(String clave, String valorString, String descripcion, String categoria) {
        this.clave = clave;
        this.valorString = valorString;
        this.descripcion = descripcion;
        this.tipoValor = "STRING";
        this.categoria = categoria;
    }

    public Configuracion(String clave, Boolean valorBoolean, String descripcion, String categoria) {
        this.clave = clave;
        this.valorBoolean = valorBoolean;
        this.descripcion = descripcion;
        this.tipoValor = "BOOLEAN";
        this.categoria = categoria;
    }

    public Configuracion(String clave, Double valorDouble, String descripcion, String categoria) {
        this.clave = clave;
        this.valorDouble = valorDouble;
        this.descripcion = descripcion;
        this.tipoValor = "DOUBLE";
        this.categoria = categoria;
    }

    public Object getValor() {
        switch (tipoValor) {
            case "INTEGER":
                return valorInt;
            case "STRING":
                return valorString;
            case "BOOLEAN":
                return valorBoolean;
            case "DOUBLE":
                return valorDouble;
            default:
                return null;
        }
    }

}