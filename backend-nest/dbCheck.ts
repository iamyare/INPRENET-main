import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'oracle',
  username: 'c##test',
  password: '12345678',
  host: 'localhost',
  port: 1521,
  sid: 'xe' 
});

async function checkIdentifierLengths(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const tables = await queryRunner.query(`SELECT table_name FROM user_tables`);
  const columns = await queryRunner.query(`SELECT table_name, column_name FROM user_tab_columns`);
  const indexes = await queryRunner.query(`SELECT index_name FROM user_indexes`);

  const longIdentifiers = {
    tables: tables.filter(t => t.TABLE_NAME.length > 30),
    columns: columns.filter(c => c.COLUMN_NAME.length > 30),
    indexes: indexes.filter(i => i.INDEX_NAME.length > 30),
  };

  await queryRunner.release();

  return longIdentifiers;
}

dataSource.initialize()
  .then(async (dataSource) => {
    const results = await checkIdentifierLengths(dataSource);
    console.log('Identificadores que exceden el límite de longitud:', results);
  })
  .catch(error => console.error('Error al inicializar la fuente de datos:', error));

  