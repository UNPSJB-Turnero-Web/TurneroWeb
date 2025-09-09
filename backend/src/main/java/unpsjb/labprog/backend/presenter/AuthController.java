package unpsjb.labprog.backend.presenter;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import unpsjb.labprog.backend.Response;
import unpsjb.labprog.backend.business.service.RegistrationService;
import unpsjb.labprog.backend.business.service.UserService;
import unpsjb.labprog.backend.config.JwtTokenProvider;
import unpsjb.labprog.backend.dto.CheckEmailRequest;
import unpsjb.labprog.backend.dto.CheckEmailResponse;
import unpsjb.labprog.backend.dto.LoginRequest;
import unpsjb.labprog.backend.dto.LoginResponse;
import unpsjb.labprog.backend.dto.RefreshTokenRequest;
import unpsjb.labprog.backend.dto.RegisterRequest;
import unpsjb.labprog.backend.model.User;

/**
 * Controlador para endpoints de autenticación
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private RegistrationService registrationService;

    /**
     * Endpoint de login
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest request) {
        try {
            // Autenticar usuario
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = (User) authentication.getPrincipal();

            // Generar tokens
            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            // Crear response
            LoginResponse loginResponse = new LoginResponse(
                accessToken, 
                refreshToken, 
                user.getEmail(), 
                user.getNombre() + " " + user.getApellido(),
                user.getRole() != null ? user.getRole().getName() : "USER"
            );

            return Response.response(HttpStatus.OK, "Login exitoso", loginResponse);

        } catch (BadCredentialsException e) {
            return Response.response(HttpStatus.UNAUTHORIZED, "Credenciales inválidas", null);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error interno del servidor: " + e.getMessage(), null);
        }
    }

    /**
     * Endpoint de refresh token
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<Object> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();

            // Validar refresh token
            if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
                return Response.response(HttpStatus.UNAUTHORIZED, "Refresh token inválido o expirado", null);
            }

            // Extraer usuario del refresh token
            String email = jwtTokenProvider.extractUsername(refreshToken);
            UserDetails userDetails = userService.loadUserByUsername(email);

            // Generar nuevo access token
            String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);

            return Response.response(HttpStatus.OK, "Token renovado exitosamente", 
                new LoginResponse(newAccessToken, refreshToken, email, 
                    ((User) userDetails).getNombre() + " " + ((User) userDetails).getApellido(),
                    ((User) userDetails).getRole() != null ? ((User) userDetails).getRole().getName() : "USER"));

        } catch (Exception e) {
            return Response.response(HttpStatus.UNAUTHORIZED, "Error al renovar token: " + e.getMessage(), null);
        }
    }

    /**
     * Endpoint de registro de nuevo PACIENTE
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody RegisterRequest request) {
        try {
            // Verificar si el email ya está registrado
            if (registrationService.existsByEmail(request.getEmail())) {
                return Response.response(HttpStatus.CONFLICT, "El email ya está registrado", null);
            }

            // Verificar si el DNI ya está registrado
            if (registrationService.existsByDni(request.getDniAsLong())) {
                return Response.response(HttpStatus.CONFLICT, "El DNI ya está registrado", null);
            }

            // Registrar paciente usando RegistrationService (crea tanto User como Paciente)
            registrationService.registrarPaciente(
                request.getEmail(),
                request.getPassword(),
                request.getDniAsLong(),
                request.getNombre(),
                request.getApellido(),
                request.getTelefono()
            );

            // Obtener el usuario creado para generar tokens
            User newUser = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Error al obtener usuario después del registro"));

            String accessToken = jwtTokenProvider.generateAccessToken(newUser);
            String refreshToken = jwtTokenProvider.generateRefreshToken(newUser);

            LoginResponse response = new LoginResponse(
                accessToken,
                refreshToken,
                newUser.getEmail(),
                newUser.getNombre() + " " + newUser.getApellido(),
                newUser.getRole() != null ? newUser.getRole().getName() : "USER"
            );

            return Response.response(HttpStatus.OK, "Usuario registrado exitosamente", response);

        } catch (IllegalArgumentException e) {
            return Response.response(HttpStatus.BAD_REQUEST, 
                "Error de validación: " + e.getMessage(), null);
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al registrar usuario: " + e.getMessage(), null);
        }
    }

    /**
     * Endpoint para verificar si un email existe y obtener información básica del usuario
     * POST /api/auth/check-email
     */
    @PostMapping("/check-email")
    public ResponseEntity<Object> checkEmail(@RequestBody CheckEmailRequest request) {
        try {
            Optional<User> userOptional = userService.findByEmail(request.getEmail());
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                // Crear response con información básica del usuario
                CheckEmailResponse response = new CheckEmailResponse(
                    user.getEmail(),
                    user.getNombre() + " " + user.getApellido(),
                    user.getRole() != null ? user.getRole().getName() : "USER"
                );
                
                return Response.response(HttpStatus.OK, "Email encontrado", response);
            } else {
                return Response.response(HttpStatus.NOT_FOUND, "Email no encontrado", null);
            }
            
        } catch (Exception e) {
            return Response.response(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error al verificar email: " + e.getMessage(), null);
        }
    }
}
