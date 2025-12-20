import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando sembrado de base de datos (Seeding)...');

    // 1. Crear Roles
    const roles = [
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'USER' },
    ];

    for (const role of roles) {
        const upsertRole = await prisma.role.upsert({
            where: { id: role.id },
            update: {}, // Si existe, no hace nada
            create: {
                id: role.id,
                name: role.name,
            },
        });
        console.log(`Role creado/verificado: ${upsertRole.name}`);
    }

    console.log('✅ Seeding completado.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });