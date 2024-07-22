--Generar planilla Ordinaria
CREATE OR REPLACE PROCEDURE InsertarPagoBeneficios(
    tipos_persona IN VARCHAR2
) IS
    v_proceso VARCHAR2(30);
BEGIN
    IF tipos_persona IN ('BENEFICIARIO,AFILIADO', 'AFILIADO,BENEFICIARIO') THEN
        v_proceso := 'ORDINARIA - BENEFICIARIOS';
    ELSIF tipos_persona IN ('JUBILADO,VOLUNTARIO,PENSIONADO', 'JUBILADO,PENSIONADO,VOLUNTARIO', 'PENSIONADO,JUBILADO,VOLUNTARIO', 
                            'PENSIONADO,VOLUNTARIO,JUBILADO', 'VOLUNTARIO,JUBILADO,PENSIONADO', 'VOLUNTARIO,PENSIONADO,JUBILADO') THEN
        v_proceso := 'ORDINARIA - JUBILADOS';
    ELSE
        RAISE_APPLICATION_ERROR(-20001, 'Tipos de persona no reconocidos');
    END IF;

    INSERT INTO NET_DETALLE_PAGO_BENEFICIO (
        ESTADO, FECHA_CARGA, MONTO_A_PAGAR, ID_PLANILLA, ID_AF_BANCO, ID_PERSONA, ID_CAUSANTE, ID_DETALLE_PERSONA, ID_BENEFICIO, PROCESO
    )
    SELECT 
        'NO PAGADA',
        SYSDATE,
        sub_dpb.MONTO_A_PAGAR,
        NULL,
        pb.ID_AF_BANCO,
        dp.ID_PERSONA,
        dp.ID_CAUSANTE,
        dp.ID_DETALLE_PERSONA,
        sub_dpb.ID_BENEFICIO,
        v_proceso -- Incluye el valor del proceso determinado
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
        AND ea.NOMBRE_ESTADO = 'RECIBIENDO BENEFICIO'
        AND SYSDATE BETWEEN dba.PERIODO_INICIO AND dba.PERIODO_FINALIZACION
        AND per.FALLECIDO = 'NO'
        AND NOT EXISTS (
            SELECT 1
            FROM NET_DETALLE_PAGO_BENEFICIO existing_dpb
            WHERE existing_dpb.ID_PERSONA = dp.ID_PERSONA
              AND existing_dpb.ID_CAUSANTE = dp.ID_CAUSANTE
              AND existing_dpb.ID_DETALLE_PERSONA = dp.ID_DETALLE_PERSONA
              AND existing_dpb.ID_BENEFICIO = sub_dpb.ID_BENEFICIO
              AND existing_dpb.ESTADO = 'NO PAGADA'
              AND TO_CHAR(existing_dpb.FECHA_CARGA, 'YYYY-MM') = TO_CHAR(SYSDATE, 'YYYY-MM')
        );
END;
/




--ORDINARIA - JUBILADOS
BEGIN
    InsertarPagoBeneficios('BENEFICIARIO,AFILIADO');
END;
/

--ORDINARIA - BENEFICIARIOS
BEGIN
    InsertarPagoBeneficios('JUBILADO,VOLUNTARIO,PENSIONADO');
END;
/


--Generar planilla Complementaria
CREATE OR REPLACE PROCEDURE InsertarBeneficiosNuncaPagados(
    tipos_persona IN VARCHAR2
) IS
    v_proceso VARCHAR2(30);
BEGIN
    IF tipos_persona IN ('BENEFICIARIO,AFILIADO', 'AFILIADO,BENEFICIARIO') THEN
        v_proceso := 'COMPLEMENTARIA - BENEFICIARIOS';
    ELSIF tipos_persona IN ('JUBILADO,VOLUNTARIO,PENSIONADO', 'JUBILADO,PENSIONADO,VOLUNTARIO', 'PENSIONADO,JUBILADO,VOLUNTARIO', 
                            'PENSIONADO,VOLUNTARIO,JUBILADO', 'VOLUNTARIO,JUBILADO,PENSIONADO', 'VOLUNTARIO,PENSIONADO,JUBILADO') THEN
        v_proceso := 'COMPLEMENTARIA - JUBILADOS';
    ELSE
        RAISE_APPLICATION_ERROR(-20001, 'Tipos de persona no reconocidos');
    END IF;

    INSERT INTO NET_DETALLE_PAGO_BENEFICIO (
        ESTADO, FECHA_CARGA, MONTO_A_PAGAR, ID_PLANILLA, ID_AF_BANCO, ID_PERSONA, ID_CAUSANTE, ID_DETALLE_PERSONA, ID_BENEFICIO, PROCESO
    )
    SELECT 
        'NO PAGADA',
        SYSDATE,
        dba.MONTO_TOTAL,
        NULL,
        pb.ID_AF_BANCO,
        dp.ID_PERSONA,
        dp.ID_CAUSANTE,
        dp.ID_DETALLE_PERSONA,
        dba.ID_BENEFICIO,
        v_proceso
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
        AND ea.NOMBRE_ESTADO = 'RECIBIENDO BENEFICIO'
        AND SYSDATE BETWEEN dba.PERIODO_INICIO AND dba.PERIODO_FINALIZACION
        AND per.FALLECIDO = 'NO'
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
              AND existing_dpb2.ESTADO <> 'NO PAGADA'
        );
END;
/

--COMPLEMENTARIA - BENEFICIARIOS
BEGIN
    InsertarBeneficiosNuncaPagados('BENEFICIARIO,AFILIADO');
END;
/

--COMPLEMENTARIA - JUBILADOS
BEGIN
    InsertarBeneficiosNuncaPagados('JUBILADO,VOLUNTARIO,PENSIONADO');
END;
/
