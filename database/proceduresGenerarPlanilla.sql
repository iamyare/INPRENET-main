--Generar planilla Ordinaria
CREATE OR REPLACE PROCEDURE InsertarPlanillaOrdinaria(
    tipos_persona IN VARCHAR2
) IS
    v_proceso VARCHAR2(30);
    v_id_planilla NUMBER;
BEGIN
    IF tipos_persona IN ('BENEFICIARIO,AFILIADO', 'AFILIADO,BENEFICIARIO') THEN
        v_proceso := 'ORDINARIA - BENEFICIARIOS';
        -- Buscar ID_PLANILLA para Beneficiarios
        BEGIN
            SELECT ID_PLANILLA
            INTO v_id_planilla
            FROM NET_PLANILLA
            WHERE ESTADO = 'ACTIVA'
            AND ID_TIPO_PLANILLA = 2
            AND ROWNUM = 1;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20002, 'No se encontró una planilla activa para Beneficiarios');
        END;
    ELSIF tipos_persona IN ('JUBILADO,VOLUNTARIO,PENSIONADO', 'JUBILADO,PENSIONADO,VOLUNTARIO', 'PENSIONADO,JUBILADO,VOLUNTARIO', 
                            'PENSIONADO,VOLUNTARIO,JUBILADO', 'VOLUNTARIO,JUBILADO,PENSIONADO', 'VOLUNTARIO,PENSIONADO,JUBILADO') THEN
        v_proceso := 'ORDINARIA - JUBILADOS';
        -- Buscar ID_PLANILLA para Jubilados
        BEGIN
            SELECT ID_PLANILLA
            INTO v_id_planilla
            FROM NET_PLANILLA
            WHERE ESTADO = 'ACTIVA'
            AND ID_TIPO_PLANILLA = 1
            AND ROWNUM = 1;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20002, 'No se encontró una planilla activa para Jubilados');
        END;
    ELSE
        RAISE_APPLICATION_ERROR(-20001, 'Tipos de persona no reconocidos');
    END IF;

    INSERT INTO NET_DETALLE_PAGO_BENEFICIO (
        ESTADO, FECHA_CARGA, MONTO_A_PAGAR, ID_PLANILLA, ID_AF_BANCO, ID_PERSONA, ID_CAUSANTE, ID_DETALLE_PERSONA, ID_BENEFICIO
    )
    SELECT 
        'EN PRELIMINAR',
        SYSDATE,
        sub_dpb.MONTO_A_PAGAR,
        v_id_planilla, -- Usar el ID_PLANILLA obtenido
        pb.ID_AF_BANCO,
        dp.ID_PERSONA,
        dp.ID_CAUSANTE,
        dp.ID_DETALLE_PERSONA,
        sub_dpb.ID_BENEFICIO
    FROM
        NET_DETALLE_PERSONA dp
    INNER JOIN
        NET_TIPO_PERSONA tp ON dp.ID_TIPO_PERSONA = tp.ID_TIPO_PERSONA
    INNER JOIN
        NET_PERSONA per ON dp.ID_PERSONA = per.ID_PERSONA
    INNER JOIN
        NET_PERSONA_POR_BANCO pb ON dp.ID_PERSONA = pb.ID_PERSONA
    INNER JOIN
        NET_ESTADO_AFILIACION ea ON dp.ID_ESTADO_AFILIACION = ea.CODIGO
    INNER JOIN
        (SELECT dpb1.ID_PERSONA, dpb1.ID_CAUSANTE, dpb1.ID_DETALLE_PERSONA, dpb1.ID_BENEFICIO, 
                dpb1.MONTO_A_PAGAR,
                ROW_NUMBER() OVER (PARTITION BY dpb1.ID_PERSONA, dpb1.ID_CAUSANTE, dpb1.ID_DETALLE_PERSONA, dpb1.ID_BENEFICIO 
                                   ORDER BY dpb1.FECHA_CARGA DESC) AS rn
         FROM NET_DETALLE_PAGO_BENEFICIO dpb1
         WHERE dpb1.ESTADO = 'PAGADA') sub_dpb 
        ON dp.ID_PERSONA = sub_dpb.ID_PERSONA 
       AND dp.ID_CAUSANTE = sub_dpb.ID_CAUSANTE 
       AND dp.ID_DETALLE_PERSONA = sub_dpb.ID_DETALLE_PERSONA 
       AND sub_dpb.rn = 1
    INNER JOIN
        NET_DETALLE_BENEFICIO_AFILIADO dba ON dp.ID_PERSONA = dba.ID_PERSONA 
                                           AND dp.ID_CAUSANTE = dba.ID_CAUSANTE 
                                           AND dp.ID_DETALLE_PERSONA = dba.ID_DETALLE_PERSONA 
                                           AND sub_dpb.ID_BENEFICIO = dba.ID_BENEFICIO
    WHERE
        tp.TIPO_PERSONA IN (SELECT TRIM(REGEXP_SUBSTR(tipos_persona, '[^,]+', 1, LEVEL))
                            FROM DUAL
                            CONNECT BY REGEXP_SUBSTR(tipos_persona, '[^,]+', 1, LEVEL) IS NOT NULL)
        AND SYSDATE BETWEEN dba.PERIODO_INICIO AND dba.PERIODO_FINALIZACION
        AND NOT EXISTS (
            SELECT 1
            FROM NET_DETALLE_PAGO_BENEFICIO existing_dpb
            WHERE existing_dpb.ID_PERSONA = dp.ID_PERSONA
              AND existing_dpb.ID_CAUSANTE = dp.ID_CAUSANTE
              AND existing_dpb.ID_DETALLE_PERSONA = dp.ID_DETALLE_PERSONA
              AND existing_dpb.ID_BENEFICIO = sub_dpb.ID_BENEFICIO
              AND existing_dpb.ESTADO = 'EN PRELIMINAR'
              AND TO_CHAR(existing_dpb.FECHA_CARGA, 'YYYY-MM') = TO_CHAR(SYSDATE, 'YYYY-MM')
        );

    -- Actualizar beneficios_cargados a 'SI'
    UPDATE NET_PLANILLA
    SET BENEFICIOS_CARGADOS = 'SI'
    WHERE ID_PLANILLA = v_id_planilla;
END;
/



--ORDINARIA - JUBILADOS
BEGIN
    InsertarPlanillaOrdinaria('BENEFICIARIO,AFILIADO');
END;
/

--ORDINARIA - BENEFICIARIOS
BEGIN
    InsertarPlanillaOrdinaria('JUBILADO,VOLUNTARIO,PENSIONADO');
END;
/


--Generar planilla Complementaria
CREATE OR REPLACE PROCEDURE InsertarPlanillaComplementaria(
    tipos_persona IN VARCHAR2
) IS
    v_proceso VARCHAR2(30);
    v_id_planilla NUMBER;
BEGIN
    IF tipos_persona IN ('BENEFICIARIO,AFILIADO', 'AFILIADO,BENEFICIARIO') THEN
        v_proceso := 'COMPLEMENTARIA - BENEFICIARIOS';
        -- Buscar ID_PLANILLA para Beneficiarios
        BEGIN
            SELECT ID_PLANILLA
            INTO v_id_planilla
            FROM NET_PLANILLA
            WHERE ESTADO = 'ACTIVA'
            AND ID_TIPO_PLANILLA = 4
            AND ROWNUM = 1;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20002, 'No se encontró una planilla activa para Beneficiarios');
        END;
    ELSIF tipos_persona IN ('JUBILADO,VOLUNTARIO,PENSIONADO', 'JUBILADO,PENSIONADO,VOLUNTARIO', 'PENSIONADO,JUBILADO,VOLUNTARIO', 
                            'PENSIONADO,VOLUNTARIO,JUBILADO', 'VOLUNTARIO,JUBILADO,PENSIONADO', 'VOLUNTARIO,PENSIONADO,JUBILADO') THEN
        v_proceso := 'COMPLEMENTARIA - JUBILADOS';
        -- Buscar ID_PLANILLA para Jubilados
        BEGIN
            SELECT ID_PLANILLA
            INTO v_id_planilla
            FROM NET_PLANILLA
            WHERE ESTADO = 'ACTIVA'
            AND ID_TIPO_PLANILLA = 3
            AND ROWNUM = 1;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20002, 'No se encontró una planilla activa para Jubilados');
        END;
    ELSE
        RAISE_APPLICATION_ERROR(-20001, 'Tipos de persona no reconocidos');
    END IF;

    INSERT INTO NET_DETALLE_PAGO_BENEFICIO (
        ESTADO, FECHA_CARGA, MONTO_A_PAGAR, ID_PLANILLA, ID_AF_BANCO, ID_PERSONA, ID_CAUSANTE, ID_DETALLE_PERSONA, ID_BENEFICIO
    )
    SELECT 
        'EN PRELIMINAR',
        SYSDATE,
        dba.MONTO_TOTAL,
        v_id_planilla, -- Usar el ID_PLANILLA obtenido
        pb.ID_AF_BANCO,
        dp.ID_PERSONA,
        dp.ID_CAUSANTE,
        dp.ID_DETALLE_PERSONA,
        dba.ID_BENEFICIO
    FROM
        NET_DETALLE_PERSONA dp
    INNER JOIN
        NET_TIPO_PERSONA tp ON dp.ID_TIPO_PERSONA = tp.ID_TIPO_PERSONA
    INNER JOIN
        NET_PERSONA per ON dp.ID_PERSONA = per.ID_PERSONA
    INNER JOIN
        NET_PERSONA_POR_BANCO pb ON dp.ID_PERSONA = pb.ID_PERSONA
    INNER JOIN
        NET_ESTADO_AFILIACION ea ON dp.ID_ESTADO_AFILIACION = ea.CODIGO
    INNER JOIN
        NET_DETALLE_BENEFICIO_AFILIADO dba ON dp.ID_PERSONA = dba.ID_PERSONA 
                                           AND dp.ID_CAUSANTE = dba.ID_CAUSANTE 
                                           AND dp.ID_DETALLE_PERSONA = dba.ID_DETALLE_PERSONA 
    WHERE
        tp.TIPO_PERSONA IN (SELECT TRIM(REGEXP_SUBSTR(tipos_persona, '[^,]+', 1, LEVEL))
                            FROM DUAL
                            CONNECT BY REGEXP_SUBSTR(tipos_persona, '[^,]+', 1, LEVEL) IS NOT NULL)
        AND SYSDATE BETWEEN dba.PERIODO_INICIO AND dba.PERIODO_FINALIZACION
        AND dba.ESTADO_SOLICITUD = 'APROBADO'
        AND NOT EXISTS (
            SELECT 1
            FROM NET_DETALLE_PAGO_BENEFICIO existing_dpb
            WHERE existing_dpb.ID_PERSONA = dp.ID_PERSONA
              AND existing_dpb.ID_CAUSANTE = dp.ID_CAUSANTE
              AND existing_dpb.ID_DETALLE_PERSONA = dp.ID_DETALLE_PERSONA
              AND existing_dpb.ID_BENEFICIO = dba.ID_BENEFICIO
        )
        AND NOT EXISTS (
            SELECT 1
            FROM NET_DETALLE_PAGO_BENEFICIO existing_dpb2
            WHERE existing_dpb2.ID_PERSONA = dp.ID_PERSONA
              AND existing_dpb2.ID_CAUSANTE = dp.ID_CAUSANTE
              AND existing_dpb2.ID_DETALLE_PERSONA = dp.ID_DETALLE_PERSONA
              AND existing_dpb2.ID_BENEFICIO = dba.ID_BENEFICIO
              AND existing_dpb2.ESTADO <> 'EN PRELIMINAR'
        );

    -- Actualizar beneficios_cargados a 'SI'
    UPDATE NET_PLANILLA
    SET BENEFICIOS_CARGADOS = 'SI'
    WHERE ID_PLANILLA = v_id_planilla;
END;
/

--COMPLEMENTARIA - BENEFICIARIOS
BEGIN
    InsertarPlanillaComplementaria('BENEFICIARIO,AFILIADO');
END;
/

--COMPLEMENTARIA - JUBILADOS
BEGIN
    InsertarPlanillaComplementaria('JUBILADO,VOLUNTARIO,PENSIONADO');
END;
/


--COPIAR PLANILLA ORDINARIA DE MES ANTERIOR
CREATE OR REPLACE PROCEDURE sp_insertar_detalles_en_preliminar(p_id_tipo_planilla IN NUMBER) IS
    v_beneficios_cargados VARCHAR2(2);
    v_id_planilla NUMBER;
BEGIN
    -- Buscar la ID_PLANILLA que esté en estado ACTIVA y dentro del mes actual
    SELECT p.ID_PLANILLA, p.BENEFICIOS_CARGADOS
    INTO v_id_planilla, v_beneficios_cargados
    FROM NET_PLANILLA p
    WHERE p.ID_TIPO_PLANILLA = p_id_tipo_planilla
    AND p.ESTADO = 'ACTIVA'
    AND TO_DATE(p.PERIODO_INICIO, 'DD/MM/YYYY') <= TRUNC(SYSDATE, 'MM')
    AND TO_DATE(p.PERIODO_FINALIZACION, 'DD/MM/YYYY') >= TRUNC(SYSDATE, 'MM')
    FOR UPDATE;

    -- Si no existe una planilla con BENEFICIOS_CARGADOS = 'SI', proceder con las inserciones y actualizar el valor a 'SI'
    IF v_beneficios_cargados IS NULL OR v_beneficios_cargados = 'NO' THEN
        -- Insertar en NET_DETALLE_PAGO_BENEFICIO
        INSERT INTO NET_DETALLE_PAGO_BENEFICIO (
            ESTADO,
            MONTO_A_PAGAR,
            ID_PLANILLA,
            ID_AF_BANCO,
            ID_PERSONA,
            ID_CAUSANTE,
            ID_DETALLE_PERSONA,
            ID_BENEFICIO
        )
        SELECT
            'EN PRELIMINAR',
            dpb.MONTO_A_PAGAR,
            v_id_planilla,
            dpb.ID_AF_BANCO,
            dpb.ID_PERSONA,
            dpb.ID_CAUSANTE,
            dpb.ID_DETALLE_PERSONA,
            dpb.ID_BENEFICIO
        FROM 
            NET_DETALLE_PAGO_BENEFICIO dpb
        JOIN 
            NET_PLANILLA p ON dpb.ID_PLANILLA = p.ID_PLANILLA
        JOIN 
            NET_TIPO_PLANILLA tp ON p.ID_TIPO_PLANILLA = tp.ID_TIPO_PLANILLA
        WHERE 
            dpb.FECHA_CARGA >= TRUNC(ADD_MONTHS(SYSDATE, -1), 'MM')
            AND dpb.FECHA_CARGA < TRUNC(SYSDATE, 'MM')
            AND tp.ID_TIPO_PLANILLA = p_id_tipo_planilla;

        -- Insertar en NET_DETALLE_DEDUCCION
        INSERT INTO NET_DETALLE_DEDUCCION (
            MONTO_TOTAL,
            MONTO_APLICADO,
            ESTADO_APLICACION,
            ANIO,
            MES,
            ID_PERSONA,
            ID_PLANILLA,
            ID_DEDUCCION,
            ID_DEDUCCION_ASIGNADA
        )
        SELECT
            dd.MONTO_TOTAL,
            dd.MONTO_APLICADO,
            'EN PRELIMINAR',
            dd.ANIO,
            dd.MES,
            dd.ID_PERSONA,
            v_id_planilla,
            dd.ID_DEDUCCION,
            dd.ID_DEDUCCION_ASIGNADA
        FROM 
            NET_DETALLE_DEDUCCION dd
        JOIN 
            NET_PLANILLA p ON dd.ID_PLANILLA = p.ID_PLANILLA
        JOIN 
            NET_TIPO_PLANILLA tp ON p.ID_TIPO_PLANILLA = tp.ID_TIPO_PLANILLA
        WHERE 
            dd.FECHA_APLICADO >= TRUNC(ADD_MONTHS(SYSDATE, -1), 'MM')
            AND dd.FECHA_APLICADO < TRUNC(SYSDATE, 'MM')
            AND tp.ID_TIPO_PLANILLA = p_id_tipo_planilla;

        -- Actualizar BENEFICIOS_CARGADOS a 'SI' en la tabla NET_PLANILLA
        UPDATE NET_PLANILLA p
        SET p.BENEFICIOS_CARGADOS = 'SI'
        WHERE p.ID_PLANILLA = v_id_planilla;

        COMMIT;
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- Manejo del caso donde no se encuentra una planilla activa
        RAISE_APPLICATION_ERROR(-20001, 'No se encontró una planilla activa para el mes actual.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END sp_insertar_detalles_en_preliminar;
/

BEGIN
    sp_insertar_detalles_en_preliminar(2);
END;
/
