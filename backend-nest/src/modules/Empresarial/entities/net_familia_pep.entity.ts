import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Net_Peps } from 'src/modules/Empresarial/entities/net_peps.entity';
import { Net_Familia } from 'src/modules/Persona/entities/net_familia.entity';

@Entity({ name: 'NET_FAMILIA_PEP' })
export class Net_Familia_Pep {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ID_FAMILIA_PEP', primaryKeyConstraintName: 'PK_id_familia_pep' })
  id_familia_pep: number;

  @ManyToOne(() => Net_Familia, familia => familia.familia_pep)
  @JoinColumn({ name: 'ID_FAMILIA', foreignKeyConstraintName: 'FK_id_familia' })
  familia: Net_Familia;
 
 @ManyToOne(() => Net_Peps, pep => pep.familia_pep)
  @JoinColumn({ name: 'ID_PEP', foreignKeyConstraintName: 'FK_id_pep_fam_pep' })
  pep: Net_Peps; 
}
