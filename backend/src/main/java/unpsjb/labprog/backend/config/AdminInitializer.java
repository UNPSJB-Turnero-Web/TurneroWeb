package unpsjb.labprog.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import unpsjb.labprog.backend.business.service.UserService;
import unpsjb.labprog.backend.model.User;

/**
 * Componente que se ejecuta al inicio de la aplicación para crear 
 * el usuario administrador inicial si no existe.
 */
@Component
public class AdminInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);
    
    @Value("${admin.seed.enabled:true}")
    private Boolean adminSeedEnabled;
    
    @Value("${admin.seed.email:admin@turneroweb.com}")
    private String adminEmail;
    
    @Value("${admin.seed.password:AdminTurnero2025}")
    private String adminPassword;
    
    @Value("${admin.seed.nombre:Administrador}")
    private String adminNombre;
    
    @Value("${admin.seed.apellido:Sistema}")
    private String adminApellido;
    
    @Value("${admin.seed.dni:99999999}")
    private Long adminDni;
    
    @Value("${admin.seed.telefono:+54-9-11-0000-0000}")
    private String adminTelefono;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (!adminSeedEnabled) {
            logger.info("🔧 Admin seed está deshabilitado (admin.seed.enabled=false)");
            return;
        }
        
        try {
            logger.info("🚀 Verificando administrador inicial...");
            
            // Verificar si ya existe el usuario administrador
            if (userService.existsByEmail(adminEmail)) {
                logger.info("✅ El administrador inicial ya existe: {}", adminEmail);
                return;
            }
            
            logger.info("👤 Creando usuario administrador inicial...");
            
            // Crear el usuario administrador usando UserService
            String hashedPassword = passwordEncoder.encode(adminPassword);
            
            User adminUser = userService.createUserWithAudit(
                adminNombre,
                adminApellido, 
                adminDni,
                adminEmail,
                hashedPassword,
                adminTelefono,
                "ADMINISTRADOR",
                "SYSTEM_INITIAL_SEED"
            );
            
            // Activar la cuenta del administrador (emailVerified = true)
            adminUser.activateAccount();
            userService.save(adminUser);
            
            logger.info("✅ Cuenta de administrador activada automáticamente (email verificado)");
            
            
            logger.info("✅ Administrador inicial creado exitosamente:");
            logger.info("   📧 Email: {}", adminEmail);
            logger.info("   🆔 DNI: {}", adminDni);
            logger.warn("⚠️  IMPORTANTE: El administrador debe cambiar su contraseña en el primer login");
            logger.info("🔐 Credenciales temporales configuradas desde variables de entorno");
            
        } catch (Exception e) {
            logger.error("❌ Error al crear el administrador inicial: {}", e.getMessage());
            logger.error("   Verifique las variables de entorno y la configuración de la base de datos");
            // No lanzar excepción para no impedir el startup de la aplicación
        }
    }
    
    /**
     * Información sobre la configuración del administrador inicial
     */
    public void logConfiguration() {
        if (adminSeedEnabled) {
            logger.info("🔧 Configuración del administrador inicial:");
            logger.info("   📧 Email: {}", adminEmail);
            logger.info("   🆔 DNI: {}", adminDni);
            logger.info("   📱 Teléfono: {}", adminTelefono);
        }
    }
}