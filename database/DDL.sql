drop table "C##TEST"."net_afiliados_por_banco" cascade constraints ;
drop table "C##TEST"."net_banco" cascade constraints ;
drop table "C##TEST"."net_beneficio" cascade constraints ;
drop table "C##TEST"."net_beneficio_planilla" cascade constraints ;
drop table "C##TEST"."net_centro_trabajo" cascade constraints ;
drop table "C##TEST"."net_datos_identificacion" cascade constraints ;
drop table "C##TEST"."net_deduccion" cascade constraints ;
drop table "C##TEST"."net_detalle_deduccion" cascade constraints ;
drop table "C##TEST"."net_empleado" cascade constraints ;
drop table "C##TEST"."net_empleado_empresa" cascade constraints ;
drop table "C##TEST"."net_empresa" cascade constraints ;
drop table "C##TEST"."net_historial_salario" cascade constraints ;
drop table "C##TEST"."net_institucion" cascade constraints ;
drop table "C##TEST"."net_municipio" cascade constraints ;
drop table "C##TEST"."net_pais" cascade constraints ;
drop table "C##TEST"."net_afiliado" cascade constraints ;
drop table "C##TEST"."net_planilla" cascade constraints ;
drop table "C##TEST"."net_provincia" cascade constraints ;
drop table "C##TEST"."net_rol" cascade constraints ;
drop table "C##TEST"."net_tipo_planilla" cascade constraints ;
drop table "C##TEST"."net_usuario" cascade constraints ;
drop table "C##TEST"."net_perf_afil_cent_trab" cascade constraints ;
drop table "C##TEST"."net_referencia_personal" cascade constraints ;
drop table "C##TEST"."net_tipo_identificacion" cascade constraints ;
drop table "C##TEST"."net_usuario" cascade constraints ;
drop table "C##TEST"."net_referencia_personal_afiliado" cascade constraints ;
drop table "C##TEST"."net_detalle_afiliado" cascade constraints  ;
drop table "C##TEST"."net_detalle_beneficio" cascade constraints  ;
drop table "C##TEST"."net_detalle_beneficio_afiliado" cascade constraints  ;
drop table "C##TEST"."net_detalle_pago_beneficio" cascade constraints  ;
drop table "C##TEST"."net_ref_per_afil" cascade constraints  ;
drop table "C##TEST"."net_ref_personal_afiliado" cascade constraints  ;
drop table "C##TEST"."net_deduc_tipo_planilla" cascade constraints  ;
drop table "C##TEST"."net_tipo_afiliado" cascade constraints  ;


drop TABLE "C##TEST"."net_afiliado" cascade constraints ;
drop TABLE "C##TEST"."net_afiliados_por_banco" cascade constraints ;
drop TABLE "C##TEST"."net_banco" cascade constraints ;
drop TABLE "C##TEST"."net_beneficio" cascade constraints ;
drop TABLE "C##TEST"."net_centro_trabajo" cascade constraints ;
drop TABLE "C##TEST"."net_deduccion" cascade constraints ;
drop TABLE "C##TEST"."net_detalle_afiliado" cascade constraints ;
drop TABLE "C##TEST"."net_detalle_beneficio_afiliado" cascade constraints ;
drop TABLE "C##TEST"."net_detalle_deduccion" cascade constraints ;
drop TABLE "C##TEST"."net_detalle_pago_beneficio" cascade constraints ;
drop TABLE "C##TEST"."net_empleado" cascade constraints ;
drop TABLE "C##TEST"."net_empleado_empresa" cascade constraints ;
drop TABLE "C##TEST"."net_empresa" cascade constraints ;
drop TABLE "C##TEST"."net_institucion" cascade constraints ;
drop TABLE "C##TEST"."net_municipio" cascade constraints ;
drop TABLE "C##TEST"."net_pais" cascade constraints ;
drop TABLE "C##TEST"."net_perf_afil_cent_trab" cascade constraints ;
drop TABLE "C##TEST"."net_planilla" cascade constraints ;
drop TABLE "C##TEST"."net_provincia" cascade constraints ;
drop TABLE "C##TEST"."net_referencia_personal" cascade constraints ;
drop TABLE "C##TEST"."net_referencia_personal_afiliado" cascade constraints ;
drop TABLE "C##TEST"."net_rol" cascade constraints ;
drop TABLE "C##TEST"."net_tipo_deduccion" cascade constraints ;
drop TABLE "C##TEST"."net_tipo_identificacion" cascade constraints ;
drop TABLE "C##TEST"."net_tipo_planilla" cascade constraints ;
drop TABLE "C##TEST"."net_usuario" cascade constraints ;

---------------------------------------------------------------------------------------------------------------------
drop PROCEDURE calcular_suma_montos_aplicado(
    p_afiliado_id IN NUMBER,
    mes_in IN NUMBER, 
    anio_in IN NUMBER,
    mes OUT NUMBER, 
    anio OUT NUMBER,
    p_suma_montos_aplicado OUT NUMBER
) IS
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
  SELECT SUM("monto_aplicado"), "mes", "anio"
  INTO p_suma_montos_aplicado, mes, anio
  FROM "C##TEST"."detalle_deduccion"
  WHERE "id_afiliado" = p_afiliado_id AND "mes"=mes_in AND "anio"=anio_in
  GROUP BY "id_afiliado", "mes", "anio" 
 ;
 EXCEPTION
    WHEN NO_DATA_FOUND THEN
    mes:= mes_in;
    anio:= anio;
    p_suma_montos_aplicado:=0;
    
END calcular_suma_montos_aplicado;

---------------------------------------------------------------------------------------------------------------------
drop TRIGGER "trig_modificar_monto_total"
BEFORE INSERT ON "detalle_deduccion"
FOR EACH ROW
DECLARE 
  v_monto_total "C##TEST"."detalle_deduccion"."monto_total"%TYPE;
  v_afiliado "C##TEST"."detalle_deduccion"."id_afiliado"%TYPE;
  v_salario_base "C##TEST"."afiliado"."salario_base"%TYPE;
  v_suma_montos_aplicado NUMBER := 0; -- Variable para almacenar la suma de montos_aplicado
  mes NUMBER; 
  anio NUMBER;
  montoMinimo NUMBER := 100;
BEGIN
  -- Obtiene el monto total
  v_monto_total := :NEW."monto_total";

  -- Busca el afiliado
  BEGIN
    SELECT "C##TEST"."afiliado"."id_afiliado", "C##TEST"."afiliado"."salario_base"
    INTO v_afiliado, v_salario_base
    FROM "C##TEST"."afiliado"
    WHERE "C##TEST"."afiliado"."id_afiliado" = :NEW."id_afiliado";
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      -- Manejo de error: el afiliado no se encontró
      DBMS_OUTPUT.PUT_LINE('Afiliado no encontrado para ID: ' || :NEW."id_afiliado");
      RETURN;
  END;

  -- Obtener la suma de montos_aplicado
  calcular_suma_montos_aplicado(v_afiliado, :NEW."mes", :NEW."anio", mes, anio, v_suma_montos_aplicado);

  -- Ajustar Deduccionaplicada igual a Deducciontotal para idafiliados que no cumplen con las condiciones anteriores
  IF (mes = :NEW."mes" AND  anio = :NEW."anio") THEN
     IF (v_suma_montos_aplicado + v_monto_total <= GREATEST(montoMinimo, v_salario_base - montoMinimo))   THEN
        :NEW."monto_aplicado" := v_monto_total;
        --:NEW."estado_aplicacion" := 'COBRADO TOTALMENTE';
      ELSE
        IF (ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo)) = 0)   THEN
          --:NEW."estado_aplicacion" := 'NO COBRADO';
          :NEW."monto_aplicado" := 0;
        ELSIF (ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo)) > 0)  THEN
          --:NEW."estado_aplicacion" := 'COBRADO PARCIALMENTE';
          :NEW."monto_aplicado" := ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo));
        END IF;
      END IF;
  ELSE  
    v_suma_montos_aplicado := 0;
    IF (v_suma_montos_aplicado + v_monto_total <= GREATEST(montoMinimo, v_salario_base - montoMinimo))   THEN
    DBMS_OUTPUT.PUT_LINE('Suma de montos_aplicado: ' || v_suma_montos_aplicado);
        :NEW."monto_aplicado" := v_monto_total;
        --:NEW."estado_aplicacion" := 'COBRADO TOTALMENTE';
      ELSE
      DBMS_OUTPUT.PUT_LINE('Suma de montos_aplicado: ' || v_suma_montos_aplicado);
        IF (ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo)) = 0)   THEN
          --:NEW."estado_aplicacion" := 'NO COBRADO';
          :NEW."monto_aplicado" := 0;
        ELSIF (ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo)) > 0)  THEN
          --:NEW."estado_aplicacion" := 'COBRADO PARCIALMENTE';
          :NEW."monto_aplicado" := ABS(v_suma_montos_aplicado - GREATEST(montoMinimo, v_salario_base - montoMinimo));
        END IF;
      END IF;
  END IF;
 
END;


---------------------------------------------------------------------------------------------------------------------
drop TRIGGER trg_incrementar_rentas_aplicadas
BEFORE UPDATE ON "C##TEST"."detalle_beneficio"
FOR EACH ROW
DECLARE
  v_old_num_rentas NUMBER;
BEGIN
  -- Almacenar el valor original de num_rentas_aplicadas
  v_old_num_rentas := :OLD."num_rentas_aplicadas";

  -- Verificar si el valor de 'estado' ha cambiado a 'PAGADA'
  IF UPDATING('estado') AND :NEW."estado" = 'PAGADA' THEN
    -- Incrementar num_rentas_aplicadas en 1
    :NEW."num_rentas_aplicadas" := v_old_num_rentas + 1;
  END IF;
END;

----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE insertar_registros(
    id_beneficio_planilla_out OUT SYS_REFCURSOR,
    cantidad_registros_insertados OUT NUMBER
) IS
    CURSOR c_detalle_beneficio_afiliado IS
       SELECT detBA."MONTO_POR_PERIODO", detBA."ID_DETALLE_BEN_AFIL"
        FROM "NET_PERSONA" persona
        INNER JOIN "net_detalle_persona" detPer ON persona."ID_PERSONA" = detPer."ID_PERSONA"
        INNER JOIN "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON 
        detPer."ID_PERSONA" = detBA."ID_BENEFICIARIO" AND
        detPer."ID_CAUSANTE" = detBA."ID_CAUSANTE"
        AND SYSDATE BETWEEN detBA."PERIODO_INICIO" AND detBA."PERIODO_FINALIZACION"
        INNER JOIN "NET_BENEFICIO" ben ON ben."ID_BENEFICIO" = detBA."ID_BENEFICIO";

    v_monto_a_pagar NUMBER;
    v_id_detalle_ben NUMBER;
    v_id_beneficio_planilla NUMBER;
    v_cursor SYS_REFCURSOR;
    
    fec_carga DATE := SYSDATE; -- Declarar y asignar SYSDATE a fec_carga aquí

BEGIN
    cantidad_registros_insertados := 0;

    OPEN c_detalle_beneficio_afiliado;

    LOOP
        FETCH c_detalle_beneficio_afiliado INTO v_monto_a_pagar, v_id_detalle_ben;
        EXIT WHEN c_detalle_beneficio_afiliado%NOTFOUND;

        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*)
            INTO v_count
            FROM "NET_DETALLE_PAGO_BENEFICIO"
            WHERE EXTRACT(YEAR FROM FECHA_CARGA) = EXTRACT(YEAR FROM fec_carga) -- Utilizar fec_carga aquí
            AND EXTRACT(MONTH FROM FECHA_CARGA) = EXTRACT(MONTH FROM fec_carga) -- Utilizar fec_carga aquí
            AND "ID_BENEFICIO_PLANILLA_AFIL" = v_id_detalle_ben;

            IF v_count = 0 THEN
                INSERT INTO "NET_DETALLE_PAGO_BENEFICIO" ("FECHA_CARGA", "MONTO_A_PAGAR", "ID_BENEFICIO_PLANILLA_AFIL")
                VALUES (fec_carga, v_monto_a_pagar, v_id_detalle_ben)
                RETURNING "ID_BENEFICIO_PLANILLA" INTO v_id_beneficio_planilla;
                
                cantidad_registros_insertados := cantidad_registros_insertados + 1;
            END IF; 
        END;
    END LOOP;
    
    OPEN v_cursor FOR
        SELECT *
        FROM "NET_DETALLE_PAGO_BENEFICIO" 
        WHERE "FECHA_CARGA" = fec_carga;

    CLOSE c_detalle_beneficio_afiliado;

    id_beneficio_planilla_out := v_cursor;
    
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;

--------------------------------------------------------------------------------------------------------------------
DECLARE
    -- Declarar variables para los parámetros de salida
    id_beneficio_planilla_out SYS_REFCURSOR;
    cantidad_registros_insertados NUMBER;
BEGIN
    -- Llamar al procedimiento insertar_registros
    insertar_registros(
        id_beneficio_planilla_out ,
        cantidad_registros_insertados 
    );
   
END;

--------------------------------------------------------------------------------------------------------------------
BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
    job_name          => 'jb_ins_regis_beneficios',
    job_type          => 'PLSQL_BLOCK',
    job_action        => 'BEGIN insertar_registros; END;',
    start_date        => SYSTIMESTAMP,
    repeat_interval   => 'FREQ=MINUTELY; INTERVAL=1', -- Cambia esto según el intervalo deseado
    enabled           => TRUE
  );
END;

BEGIN
    insertar_registros();
END;

BEGIN
  DBMS_SCHEDULER.DROP_JOB('jb_ins_benef');
END;