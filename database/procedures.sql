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
    ELSIF (sector_economico = 'PRIVADO' AND salario_base > LimiteSSL) THEN
        sueldo_neto := LimiteSSL;
    END IF;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No se encontró alguno de los valores.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;

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

    tot_deducciones := tot_aportaciones + tot_cotizaciones+prestamos;
    sueldo_neto := salario_base - (tot_deducciones);

    INSERT INTO NET_DETALLE_PLANILLA_ING (SUELDO, PRESTAMOS, APORTACIONES, COTIZACIONES, DEDUCCIONES, SUELDO_NETO, ID_PERSONA, ID_CENTRO_TRABAJO, ID_PLANILLA)
    VALUES (salario_base, prestamos, tot_aportaciones ,tot_cotizaciones, tot_deducciones, sueldo_neto ,id_persona, id_institucion, id_planilla); 

    COMMIT; -- Confirmar la inserción
    DBMS_OUTPUT.PUT_LINE('Registro insertado exitosamente en NET_SALARIO_BASE.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;



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


create or replace PROCEDURE determinar_tipo_planilla(
    mes IN NUMBER,
    v_id_tipo_planilla OUT NUMBER
)
IS
BEGIN
    IF mes IN (1, 2, 3, 4, 5, 7, 8, 9, 10, 11) THEN
        SELECT tp.ID_TIPO_PLANILLA
        INTO v_id_tipo_planilla
        FROM NET_TIPO_PLANILLA tp
        WHERE tp.NOMBRE_PLANILLA = 'PLANILLA ORDINARIA';
    ELSIF mes IN (6) THEN
        SELECT tp.ID_TIPO_PLANILLA
        INTO v_id_tipo_planilla
        FROM NET_TIPO_PLANILLA tp
        WHERE tp.NOMBRE_PLANILLA = 'PLANILLA DECIMO TERCERO';
    ELSIF mes IN (12) THEN
        SELECT tp.ID_TIPO_PLANILLA
        INTO v_id_tipo_planilla
        FROM NET_TIPO_PLANILLA tp
        WHERE tp.NOMBRE_PLANILLA = 'PLANILLA DECIMO CUARTO';
    END IF;
END determinar_tipo_planilla;



create or replace PROCEDURE aplicar_logica(
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
        determinar_tipo_planilla(mes, v_id_tipo_planilla);

        INSERT INTO NET_PLANILLA (CODIGO_PLANILLA, SECUENCIA, PERIODO_INICIO, PERIODO_FINALIZACION, ID_TIPO_PLANILLA)
        VALUES (codPlan, 1, fecha_inicio, fecha_final, v_id_tipo_planilla)
        RETURNING ID_PLANILLA INTO v_id_planilla;
        COMMIT;

        INSERT INTO NET_DETALLE_PLANILLA_ING (ID_PERSONA, ID_CENTRO_TRABAJO, SUELDO, PRESTAMOS, APORTACIONES, COTIZACIONES, DEDUCCIONES, SUELDO_NETO, ID_PLANILLA, ESTADO)
        SELECT detalle.ID_PERSONA, detalle.ID_CENTRO_TRABAJO, detalle.SUELDO, detalle.PRESTAMOS, detalle.APORTACIONES, detalle.COTIZACIONES, detalle.DEDUCCIONES, detalle.SUELDO_NETO, v_id_planilla, detalle.ESTADO
        FROM NET_DETALLE_PLANILLA_ING detalle 
        INNER JOIN NET_PERSONA persona ON persona.ID_PERSONA = detalle.ID_PERSONA  
        INNER JOIN NET_CENTRO_TRABAJO centroTrabajo ON centroTrabajo.ID_CENTRO_TRABAJO = detalle.ID_CENTRO_TRABAJO  
        INNER JOIN NET_PLANILLA planilla ON planilla.ID_PLANILLA = detalle.ID_PLANILLA  
        INNER JOIN NET_TIPO_PLANILLA tipoPlanilla ON tipoPlanilla.ID_TIPO_PLANILLA = planilla.ID_TIPO_PLANILLA 
        WHERE centroTrabajo.ID_CENTRO_TRABAJO = id_centro_trabajo_in 
        AND planilla.FECHA_APERTURA = (SELECT MAX(FECHA_APERTURA) FROM NET_PLANILLA);

        COMMIT;
    END IF;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('No se encontró ningún registro para el mes ' || mes);
        WHEN TOO_MANY_ROWS THEN
            DBMS_OUTPUT.PUT_LINE('Demasiados registros encontrados para el mes ' || mes);
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;