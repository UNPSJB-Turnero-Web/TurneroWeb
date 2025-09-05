package unpsjb.labprog.backend.presenter;

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
import unpsjb.labprog.backend.business.service.UserService;
import unpsjb.labprog.backend.config.JwtTokenProvider;
import unpsjb.labprog.backend.dto.LoginRequest;
import unpsjb.labprog.backend.dto.LoginResponse;
import unpsjb.labprog.backend.dto.RefreshTokenRequest;
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
                user.getNombre() + " " + user.getApellido()
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
                    ((User) userDetails).getNombre() + " " + ((User) userDetails).getApellido()));

        } catch (Exception e) {
            return Response.response(HttpStatus.UNAUTHORIZED, "Error al renovar token: " + e.getMessage(), null);
        }
    }
}
