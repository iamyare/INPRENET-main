import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

// Importar la configuración desde ormconfig.ts
const ormconfig = require('../../ormconfig');

async function generateEntities() {
  const dataSource = new DataSource(ormconfig);
  await dataSource.initialize();

  try {
    // Directorio donde se guardarán las entidades generadas
    const outputDir = path.join(__dirname, '../generated-entities');
    
    // Asegúrate de que el directorio exista
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Genera las entidades
    await dataSource.driver.createSchemaBuilder().log('Generating entities...');
    const entityMetadatas = dataSource.entityMetadatas;
    
    console.log(`Generated ${entityMetadatas.length} entities.`);

    // Opcionalmente puedes agregar lógica para escribir las entidades en archivos
  } catch (error) {
    console.error('Error generating entities:', error);
  } finally {
    await dataSource.destroy();
  }
}

generateEntities().catch(error => console.error(error));
