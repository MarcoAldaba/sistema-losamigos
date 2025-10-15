const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
    try {
        console.log('🔧 Regenerando passwords...\n');

        // Password que queremos usar
        const plainPassword = '123456';
        
        // Generar nuevo hash
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        console.log('✅ Nuevo hash generado:', hashedPassword);

        // Actualizar TODOS los usuarios con el nuevo hash
        const result = await pool.query(
            'UPDATE usuario SET password = $1 WHERE activo = true RETURNING usuario, nombre, rol',
            [hashedPassword]
        );

        console.log('\n✅ Passwords actualizados para:');
        result.rows.forEach(user => {
            console.log(`   - ${user.usuario} (${user.nombre}) - Rol: ${user.rol}`);
        });

        console.log('\n🎉 Todos los usuarios ahora tienen password: 123456');
        
        // Probar el hash
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('\n🔐 Verificación del hash:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixPasswords();