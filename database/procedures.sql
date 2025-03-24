create or replace PROCEDURE determinar_tipo_planilla(
    mes IN NUMBER,
    v_id_tipo_planilla OUT NUMBER,
    v_nombre_tipo_planilla OUT STRING
)
IS
BEGIN
    IF mes IN (1, 2, 3, 4, 5, 7, 8, 9, 10, 11) THEN
        SELECT tp.ID_TIPO_PLANILLA, tp.NOMBRE_PLANILLA
        INTO v_id_tipo_planilla, v_nombre_tipo_planilla
        FROM NET_TIPO_PLANILLA tp
        WHERE tp.NOMBRE_PLANILLA = 'PLANILLA ORDINARIA';
    ELSIF mes IN (6) THEN
        SELECT tp.ID_TIPO_PLANILLA, tp.NOMBRE_PLANILLA
        INTO v_id_tipo_planilla, v_nombre_tipo_planilla
        FROM NET_TIPO_PLANILLA tp
        WHERE tp.NOMBRE_PLANILLA = 'PLANILLA DECIMO TERCERO';
    ELSIF mes IN (12) THEN
        SELECT tp.ID_TIPO_PLANILLA, tp.NOMBRE_PLANILLA
        INTO v_id_tipo_planilla, v_nombre_tipo_planilla
        FROM NET_TIPO_PLANILLA tp
        WHERE tp.NOMBRE_PLANILLA = 'PLANILLA DECIMO CUARTO';
    END IF;
END determinar_tipo_planilla;

------------------
create or replace PROCEDURE obtener_id_planilla_actual(
    codPlan IN VARCHAR2,
    v_id_planilla_a OUT NUMBER
)
IS
BEGIN
    SELECT p.ID_PLANILLA
    INTO v_id_planilla_a
    FROM NET_PLANILLA p
    WHERE p.CODIGO_PLANILLA = codPlan;

    -- Si no se encontró ningún dato, asigna NULL a v_id_planilla_a
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_id_planilla_a := NULL;
END obtener_id_planilla_actual;

------------------
create or replace PROCEDURE obtener_ult_plan(
    in_tipo_planilla IN STRING,
    codPlan OUT STRING
)
IS
BEGIN
        SELECT planilla.CODIGO_PLANILLA 
        INTO codPlan
        FROM NET_PLANILLA planilla
        INNER JOIN NET_TIPO_PLANILLA tipoPlanilla ON tipoPlanilla.ID_TIPO_PLANILLA = planilla.ID_TIPO_PLANILLA
            INNER JOIN (
                SELECT MAX(FECHA_APERTURA) AS fecha_maxima
                FROM NET_PLANILLA planilla
                INNER JOIN NET_TIPO_PLANILLA tipoPlanilla ON tipoPlanilla.ID_TIPO_PLANILLA = planilla.ID_TIPO_PLANILLA
                WHERE tipoplanilla.id_tipo_planilla = in_tipo_planilla
            )  max_fecha
        ON planilla.FECHA_APERTURA = max_fecha.fecha_maxima
        WHERE tipoPlanilla.id_tipo_planilla = in_tipo_planilla;
END obtener_ult_plan;

------------------
create or replace PROCEDURE SP_CALCULAR_APORTACIONES(
    salario_base IN NUMBER,
    sector_economico IN VARCHAR2,
    sueldo_neto OUT NUMBER
)
IS
    PorcAportacionSECPUB NUMBER(10,4);
    PorcAportacionSECPriv NUMBER(10,4);
    LimiteSSL NUMBER(10,4);
    sueldoBase NUMBER(10,4);
BEGIN
    -- Obtener el Porcentaje de Aportación para el Sector Público
    SELECT VALOR INTO PorcAportacionSECPUB
    FROM NET_SALARIO_COTIZABLE
    WHERE NOMBRE = 'APORTACION SECTOR PUBLICO';

    -- Obtener el Porcentaje de Aportación para el Sector Privado
    SELECT VALOR INTO PorcAportacionSECPriv
    FROM NET_SALARIO_COTIZABLE
    WHERE NOMBRE = 'APORTACION SECTOR PRIVADO';

    -- Obtener el Límite del Salario para la Seguridad Social
    SELECT VALOR INTO LimiteSSL
    FROM NET_SALARIO_COTIZABLE
    WHERE NOMBRE = 'LIMITE SSC';

    -- Calcular el sueldo base utilizando la función SP_CALCULO_SUELDO_BASE
    SP_CALCULAR_COTIZACION_MINIMA(sueldoBase);

    -- Aplicar la lógica
    IF (salario_base <= sueldoBase AND salario_base <= LimiteSSL) THEN
        sueldo_neto := sueldoBase;
    ELSIF (sector_economico = 'PRIVADO' AND salario_base <= LimiteSSL) THEN
        sueldo_neto := salario_base * PorcAportacionSECPriv;
    END IF;
    DBMS_OUTPUT.PUT_LINE(sueldo_neto);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No se encontró alguno de los valores.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
---------------------
create or replace PROCEDURE SP_CALCULAR_COTIZACION_MINIMA (v_resultado OUT NUMBER
)
IS
    v_sueldo_base NUMBER(10,4);
    p_aportacion_minima NUMBER(10,4);
BEGIN
    -- Obtener el valor de SUELDO BASE
    SELECT VALOR
    INTO v_sueldo_base
    FROM NET_SALARIO_COTIZABLE
    WHERE NOMBRE = 'SUELDO BASE';

    -- Obtener el valor de APORTACION MINIMA
    SELECT VALOR
    INTO p_aportacion_minima
    FROM NET_SALARIO_COTIZABLE
    WHERE NOMBRE = 'APORTACION MINIMA';

    -- Realizar la multiplicación
    v_resultado := v_sueldo_base * p_aportacion_minima;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No se encontró alguno de los valores.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);

END SP_CALCULAR_COTIZACION_MINIMA;

---------------
create or replace PROCEDURE SP_CALCULAR_COTIZACIONES(
    salario_base IN NUMBER,
    sector_economico IN VARCHAR2,
    sueldo_neto OUT NUMBER
)
IS
    cotizacionDoc NUMBER(10,4);
    cotizacionEsc NUMBER(10,4);
BEGIN
    -- Obtener el Porcentaje de Aportación para el Sector Público
    SELECT VALOR INTO cotizacionDoc
    FROM NET_SALARIO_COTIZABLE
    WHERE NOMBRE = 'COTIZACION DOCENTE';

    -- Obtener el Porcentaje de Aportación para el Sector Privado
    SELECT VALOR INTO cotizacionEsc
    FROM NET_SALARIO_COTIZABLE
    WHERE NOMBRE = 'COTIZACION ESCALONADA';

    -- Aplicar la lógica
    IF (salario_base <= 20000 AND sector_economico = 'PRIVADO') THEN
        sueldo_neto := salario_base * cotizacionDoc;
    ELSIF (salario_base > 20000 AND sector_economico = 'PRIVADO') THEN
        sueldo_neto := salario_base * cotizacionEsc;
    END IF;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No se encontró alguno de los valores.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;

---------------------
create or replace PROCEDURE SP_INSERTAR_NET_DET_PLANILLA_ING(
    id_persona IN VARCHAR2,
    id_institucion IN VARCHAR2,
    salario_base IN NUMBER,
    prestamos IN NUMBER,
    sector_economico IN VARCHAR2,
    
    id_planilla IN NUMBER  
)
IS
    tot_aportaciones  NUMBER(10,4);
    tot_cotizaciones  NUMBER(10,4);
    tot_deducciones  NUMBER(10,4);
    sueldo_neto  NUMBER(10,4);
BEGIN

    SP_CALCULAR_APORTACIONES(salario_base, sector_economico, tot_aportaciones);
    SP_CALCULAR_COTIZACIONES(salario_base, sector_economico, tot_cotizaciones);

    tot_deducciones := tot_aportaciones + tot_cotizaciones + prestamos;
    sueldo_neto := salario_base - (tot_deducciones);
    DBMS_OUTPUT.PUT_LINE(salario_base);
    
    INSERT INTO NET_DETALLE_PLANILLA_ING (SUELDO, PRESTAMOS, APORTACIONES, COTIZACIONES, DEDUCCIONES, SUELDO_NETO, ID_PERSONA, ID_CENTRO_TRABAJO, ID_PLANILLA)
    VALUES (salario_base, prestamos, tot_aportaciones ,tot_cotizaciones, tot_deducciones, sueldo_neto ,id_persona, id_institucion, id_planilla); 

    COMMIT; -- Confirmar la inserción
    DBMS_OUTPUT.PUT_LINE('Registro insertado exitosamente en NET_SALARIO_BASE.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;

-------------------------
create or replace PROCEDURE SP_INSERTAR_NET_DETALLE_PAGO_BENEFICIO(
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

-----------------------
create or replace PROCEDURE SP_INSERTAR_REG_ULT_PLAN_ING_CARG(
    id_centro_trabajo_in IN NUMBER,
    mes IN NUMBER,
    año IN NUMBER
)
IS
    codPlan VARCHAR2(50) := 'PLAN-ING-' || TO_CHAR(mes) || '-' || TO_CHAR(año);
    fecha_inicio DATE := TO_DATE('01-' || TO_CHAR(mes) || '-' || TO_CHAR(año), 'DD-MM-YYYY');
    fecha_final DATE := LAST_DAY(fecha_inicio);
    v_id_planilla_a NUMBER;
    v_id_planilla NUMBER;
    v_id_tipo_planilla NUMBER;
    v_nombre_tipo_planilla VARCHAR2(50);
    codUlPlan VARCHAR2(50);
BEGIN
    -- Llama al procedimiento pasando un valor de prueba para codPlan
    OBTENER_ID_PLANILLA_ACTUAL(codPlan, v_id_planilla_a);

    IF v_id_planilla_a IS NOT NULL THEN
        FOR detalle_rec IN (
            SELECT detalle.ID_PERSONA AS id_persona, 
                    detalle.ID_CENTRO_TRABAJO AS id_centro_trabajo, 
                    detalle.SUELDO AS Sueldo, 
                    detalle.PRESTAMOS AS Prestamos, 
                    detalle.APORTACIONES AS Aportaciones, 
                    detalle.COTIZACIONES AS Cotizaciones,
                    detalle.DEDUCCIONES AS Deducciones, 
                    detalle.SUELDO_NETO AS SueldoNeto, 
                    detalle.ID_PLANILLA AS id_planilla, 
                    detalle.ESTADO AS estado
            FROM NET_DETALLE_PLANILLA_ING detalle 
            INNER JOIN NET_PERSONA persona ON persona.ID_PERSONA = detalle.ID_PERSONA  
            INNER JOIN NET_CENTRO_TRABAJO centroTrabajo ON centroTrabajo.ID_CENTRO_TRABAJO = detalle.ID_CENTRO_TRABAJO  
            INNER JOIN NET_PLANILLA planilla ON planilla.ID_PLANILLA = detalle.ID_PLANILLA  
            INNER JOIN NET_TIPO_PLANILLA tipoPlanilla ON tipoPlanilla.ID_TIPO_PLANILLA = planilla.ID_TIPO_PLANILLA 
            WHERE centroTrabajo.ID_CENTRO_TRABAJO = id_centro_trabajo_in 
            AND planilla.FECHA_APERTURA = (SELECT MAX(FECHA_APERTURA) FROM NET_PLANILLA))
        LOOP
            INSERT INTO NET_DETALLE_PLANILLA_ING (ID_PERSONA, ID_CENTRO_TRABAJO, SUELDO, PRESTAMOS, APORTACIONES, COTIZACIONES, DEDUCCIONES, SUELDO_NETO, ID_PLANILLA, ESTADO)
            VALUES (detalle_rec.id_persona, detalle_rec.id_centro_trabajo, detalle_rec.Sueldo, detalle_rec.Prestamos, detalle_rec.Aportaciones, detalle_rec.Cotizaciones, detalle_rec.Deducciones, detalle_rec.SueldoNeto, detalle_rec.id_planilla, detalle_rec.estado);
            COMMIT;
        END LOOP;
    ELSE
        determinar_tipo_planilla(mes, v_id_tipo_planilla, v_nombre_tipo_planilla);
        obtener_ult_plan(v_id_tipo_planilla, codUlPlan);

        INSERT INTO NET_PLANILLA (CODIGO_PLANILLA, SECUENCIA, PERIODO_INICIO, PERIODO_FINALIZACION, ID_TIPO_PLANILLA)
        VALUES (codPlan, 1, fecha_inicio, fecha_final, v_id_tipo_planilla)
        RETURNING ID_PLANILLA INTO v_id_planilla;

         COMMIT;
        IF (v_id_planilla IS NOT NULL) THEN
                INSERT INTO NET_DETALLE_PLANILLA_ING (
                ID_PERSONA, ID_CENTRO_TRABAJO, SUELDO, PRESTAMOS, APORTACIONES, 
                COTIZACIONES, DEDUCCIONES, SUELDO_NETO, ID_PLANILLA, ESTADO)
                SELECT 
                detalle.ID_PERSONA, detalle.ID_CENTRO_TRABAJO, detalle.SUELDO, detalle.PRESTAMOS, detalle.APORTACIONES, 
                detalle.COTIZACIONES, detalle.DEDUCCIONES, detalle.SUELDO_NETO, v_id_planilla, detalle.ESTADO
                FROM NET_DETALLE_PLANILLA_ING detalle 
                INNER JOIN NET_PERSONA persona ON persona.ID_PERSONA = detalle.ID_PERSONA  
                INNER JOIN NET_CENTRO_TRABAJO centroTrabajo ON centroTrabajo.ID_CENTRO_TRABAJO = detalle.ID_CENTRO_TRABAJO  
                INNER JOIN NET_PLANILLA planilla ON planilla.ID_PLANILLA = detalle.ID_PLANILLA  
                INNER JOIN NET_TIPO_PLANILLA tipoPlanilla ON tipoPlanilla.ID_TIPO_PLANILLA = planilla.ID_TIPO_PLANILLA 
                WHERE centroTrabajo.ID_CENTRO_TRABAJO = id_centro_trabajo_in AND planilla.CODIGO_PLANILLA = codUlPlan;

                COMMIT;     
        ELSE 
            ROLLBACK;
        END IF;
    END IF;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('No se encontró ningún registro para el mes ' || mes);
        WHEN TOO_MANY_ROWS THEN
            DBMS_OUTPUT.PUT_LINE('Demasiados registros encontrados para el mes ' || mes);
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
-----------------------
---no dan-----------
create or replace PROCEDURE calcular_suma_montos_aplicado(
    p_afiliado_id IN NUMBER,
    mes_in IN NUMBER, 
    anio_in IN NUMBER,
    mes OUT NUMBER, 
    anio OUT NUMBER,
    p_suma_montos_aplicado OUT NUMBER
) IS
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
  SELECT SUM("MONTO_APLICADO"), "MES", "ANIO"
  INTO p_suma_montos_aplicado, mes, anio
  FROM "NET_DETALLE_DEDUCCION"
  WHERE "ID_PERSONA" = p_afiliado_id AND "MES"=mes_in AND "ANIO"=anio_in
  GROUP BY "ID_PERSONA", "MES", "ANIO" 
 ;
 EXCEPTION
    WHEN NO_DATA_FOUND THEN
    mes:= mes_in;
    anio:= anio;
    p_suma_montos_aplicado:=0;

END calcular_suma_montos_aplicado;

----
create or replace PROCEDURE sp_buscar_det_ben(
    id_beneficio_afiliado IN VARCHAR
) IS
  num_rentas_aplicadas NUMBER; -- Move the declaration here
BEGIN
  SELECT "num_rentas_aplicadas"
  INTO num_rentas_aplicadas
  FROM "net_detalle_beneficio_afiliado" 
  WHERE "id_detalle_ben_afil" = id_beneficio_afiliado;

  num_rentas_aplicadas := num_rentas_aplicadas + 1; -- Increment the value

  UPDATE "net_detalle_beneficio_afiliado"
  SET "num_rentas_aplicadas" = num_rentas_aplicadas
  WHERE "id_detalle_ben_afil" = id_beneficio_afiliado;

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    num_rentas_aplicadas := 0;
END sp_buscar_det_ben;
----
create or replace PROCEDURE verificar_tipo_afiliado(p_id_participante INT, p_resultado OUT NUMBER) IS
  v_tipo_afiliado VARCHAR2(50);
BEGIN
  SELECT "tipo_afiliado" INTO v_tipo_afiliado
  FROM "net_detalle_afiliado"
  WHERE "id_afiliado" = p_id_participante;

  IF v_tipo_afiliado <> 'afiliado' THEN
    p_resultado := 1;
  ELSE
    p_resultado := 0;
  END IF;
END;
