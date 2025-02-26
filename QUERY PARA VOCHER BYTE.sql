---------------EXPORTAR A TABLA DATOS DE PLANILLA CERRADA------------------------------------------
--------------------------*------------------DPHIPA-*-----------------------*-----------------*---------
SELECT
    TO_CHAR(1) AS EMPCOD,
    TO_CHAR(p.id_tipo_identificacion) AS CLTDOC,
    p.n_identificacion AS CLDOC,
    CASE
        WHEN dpb.id_beneficio = 6 THEN 2
        ELSE 1
    END AS PBCODI,
    dpb.id_beneficio AS BNCODI,
    2025 AS HPANPA,
    2 AS HPMEPA,
    SUM(dpb.monto_a_pagar) AS HPVADO,
    TO_CHAR('P') AS HPESTA
FROM net_detalle_pago_beneficio dpb
JOIN net_persona p ON p.id_persona = dpb.id_persona
WHERE dpb.id_planilla = 335
  AND dpb.estado = 'PAGADA'
GROUP BY
    dpb.id_beneficio,
    P.id_persona,
    p.id_tipo_identificacion,
    p.n_identificacion,
    dpb.id_planilla;


-------------------------------cambiando 201 por 20
WITH Beneficios AS (
    SELECT 
        p.id_persona,
        p.id_tipo_identificacion,
        p.n_identificacion AS CLDOC,
        dpb.id_beneficio,
        dpb.id_planilla,
        dpb.monto_a_pagar,
        ROW_NUMBER() OVER (PARTITION BY p.n_identificacion ORDER BY dpb.id_beneficio) AS rn
    FROM net_detalle_pago_beneficio dpb
    JOIN net_persona p ON p.id_persona = dpb.id_persona
    WHERE dpb.id_planilla = 335
      AND dpb.estado = 'PAGADA'
)
SELECT 
    TO_CHAR(1) AS EMPCOD,
    TO_CHAR(b.id_tipo_identificacion) AS CLTDOC,
    b.CLDOC,
    CASE 
        WHEN b.id_beneficio = 6 THEN 2 
        ELSE 1 
    END AS PBCODI,
    CASE 
        WHEN COALESCE(
            NULLIF(b.id_beneficio, 6), 
            (SELECT id_beneficio FROM Beneficios b2 WHERE b2.CLDOC = b.CLDOC AND b2.id_beneficio <> 6 ORDER BY rn FETCH FIRST 1 ROWS ONLY)
        ) = 201 THEN 20
        ELSE COALESCE(
            NULLIF(b.id_beneficio, 6), 
            (SELECT id_beneficio FROM Beneficios b2 WHERE b2.CLDOC = b.CLDOC AND b2.id_beneficio <> 6 ORDER BY rn FETCH FIRST 1 ROWS ONLY)
        )
    END AS BNCODI,
    2025 AS HPANPA,
    2 AS HPMEPA,
    SUM(b.monto_a_pagar) AS HPVADO,
    TO_CHAR('P') AS HPESTA
FROM Beneficios b
GROUP BY 
    b.id_persona,
    b.id_tipo_identificacion,
    b.CLDOC,
    b.id_beneficio,  
    b.id_planilla;


---------------------*-------------------BENEFDAT/DPHIPC-----------------------*-----------------*---------
SELECT
TO_CHAR(1) AS EMPCOD,
TO_CHAR(p.id_tipo_identificacion)  AS  CLTDOC,
TP.CLDOC,
PB.ID_BENEFICIO AS BNCODI,
2025 AS HPANPA,
2 AS HPMEPA,
1 AS TPACOD,
TP.HPVALO,
NVL(TP.HPVADI, 0) AS HPVADI,
NVL(TP.HPVADE, 0) AS HPVADE,
TP.HPVAPA,
2 AS HPTIPA,
0 AS CHNSOL,
TP.HPCTAB,
TO_NUMBER(B.CODIGO_ACH) AS HPCOBA,
2025 AS HPAHOY,
2 AS HPMHOY,
13 AS HPDHOY
FROM  A_TABLA_PAGO_BENEFICIOS TP
INNER JOIN NET_PERSONA P ON TRIM(P.N_IDENTIFICACION) = TRIM(TP.CLDOC)
JOIN NET_DETALLE_PAGO_BENEFICIO PB ON PB.ID_PERSONA = P.ID_PERSONA
JOIN NET_PERSONA_POR_BANCO PR ON PB.ID_AF_BANCO = PR.ID_AF_BANCO
JOIN NET_BANCO B ON B.ID_BANCO = PR.ID_BANCO
WHERE PB.ID_PLANILLA = 335
AND PB.ID_BENEFICIO != 6;

-------------------------------cambiando 201 por 20
WITH PAGO_TOTAL AS (
    SELECT
        PAGO.ID_PERSONA,
        B.NUM_CUENTA,
        BA.CODIGO_ACH,  -- Se agrega la columna CODIGO_ACH
        MAX(
        CASE 
            WHEN PAGO.ID_BENEFICIO = 201 THEN 20  -- Cambia ID_BENEFICIO 201 por 20
            WHEN PAGO.ID_BENEFICIO != 6 THEN PAGO.ID_BENEFICIO 
            ELSE NULL 
        END
    ) AS ID_BENEFICIO,
        SUM(PAGO.MONTO_A_PAGAR) AS TOTAL_MONTO_A_PAGAR,
        PAGO.ID_PLANILLA,  -- Aseguramos que el ID_PLANILLA esté en la subconsulta
        PAGO.FECHA_CARGA  -- Se agrega la columna FECHA_CARGA
    FROM
        NET_DETALLE_PAGO_BENEFICIO PAGO
    JOIN NET_PERSONA_POR_BANCO B
        ON PAGO.ID_PERSONA = B.ID_PERSONA
        AND B.ESTADO = 'ACTIVO'  -- Se filtra solo la cuenta activa
    JOIN NET_BANCO BA
        ON B.ID_BANCO = BA.ID_BANCO
    JOIN NET_PLANILLA PL
        ON PAGO.ID_PLANILLA = PL.ID_PLANILLA
    WHERE
        PL.ID_TIPO_PLANILLA = 1  -- Filtra solo tipo de planilla 1
        AND PAGO.ESTADO = 'PAGADA'
        AND PL.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY')  -- Filtro de fecha inicio
        AND PL.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')  -- Filtro de fecha finalización
    GROUP BY
        PAGO.ID_PERSONA,
        B.NUM_CUENTA,
        BA.CODIGO_ACH,  -- Se agrega al GROUP BY
        B.ID_BANCO,  -- También es necesario incluir B.ID_BANCO en el GROUP BY
        PAGO.ID_PLANILLA,  -- Aseguramos que el ID_PLANILLA esté en el GROUP BY
        PAGO.FECHA_CARGA  -- Se agrega al GROUP BY
),
DEDUCCION_TOTAL AS (
    SELECT
        ID_PERSONA,
        SUM(CASE WHEN ID_DEDUCCION IN (1,2,3,75,76) THEN MONTO_APLICADO ELSE 0 END) AS INPREMA,
        SUM(CASE WHEN ID_DEDUCCION NOT IN (1,2,3,75,76) THEN MONTO_APLICADO ELSE 0 END) AS TERCEROS
    FROM
        NET_DETALLE_DEDUCCION
    JOIN NET_PLANILLA PL
        ON NET_DETALLE_DEDUCCION.ID_PLANILLA = PL.ID_PLANILLA
    WHERE
        PL.ID_TIPO_PLANILLA = 1  -- Filtra solo tipo de planilla 1
        AND NET_DETALLE_DEDUCCION.ESTADO_APLICACION = 'COBRADA'
        AND PL.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY')  -- Filtro de fecha inicio
        AND PL.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')  -- Filtro de fecha finalización
    GROUP BY
        ID_PERSONA
)
SELECT
    TO_CHAR(1) AS EMPCOD,
    TO_CHAR(NP.ID_TIPO_IDENTIFICACION) AS CLTDOC,
    NP.N_IDENTIFICACION AS CLDOC,
    PAGO_TOTAL.ID_BENEFICIO AS BNCODI,
    EXTRACT(YEAR FROM PL.PERIODO_INICIO) AS HPANPA,  -- Año del PERIODO_INICIO de la planilla
    EXTRACT(MONTH FROM PL.PERIODO_INICIO) AS HPMEPA,  -- Mes del PERIODO_INICIO de la planilla
    1 AS TPACOD,
    PAGO_TOTAL.TOTAL_MONTO_A_PAGAR AS HPVALO,
    COALESCE(DEDUCCION_TOTAL.INPREMA, 0) AS HPVADI,
    COALESCE(DEDUCCION_TOTAL.TERCEROS, 0) AS HPVADE,
    PAGO_TOTAL.TOTAL_MONTO_A_PAGAR -
    (COALESCE(DEDUCCION_TOTAL.INPREMA, 0) + COALESCE(DEDUCCION_TOTAL.TERCEROS, 0)) AS HPVAPA,
    2 AS HPTIPA,
    0 AS CHNSOL,
    PAGO_TOTAL.NUM_CUENTA AS HPCTAB,
    PAGO_TOTAL.CODIGO_ACH AS HPCOBA,
    EXTRACT(YEAR FROM PAGO_TOTAL.FECHA_CARGA) AS HPAHOY,
    EXTRACT(MONTH FROM PAGO_TOTAL.FECHA_CARGA) AS HPMHOY,
    EXTRACT(DAY FROM PAGO_TOTAL.FECHA_CARGA) AS HPDHOY
  -- Día de FECHA_CARGA de PAGO_TOTAL
FROM
    PAGO_TOTAL
LEFT JOIN
    DEDUCCION_TOTAL ON PAGO_TOTAL.ID_PERSONA = DEDUCCION_TOTAL.ID_PERSONA
JOIN
    NET_PERSONA NP ON PAGO_TOTAL.ID_PERSONA = NP.ID_PERSONA  -- Se agrega el JOIN con NET_PERSONA
JOIN
    NET_PLANILLA PL ON PAGO_TOTAL.ID_PLANILLA = PL.ID_PLANILLA;  -- Se agrega el JOIN con NET_PLANILLA


---------------------*---------DPHIDE No debe ir valores duplicados----------*-----------------------*-------
SELECT
    TO_CHAR(1) AS EMPCOD,
    TO_CHAR(p.id_tipo_identificacion) AS CLTDOC,
    P.N_IDENTIFICACION AS CLDOC,
    PB.ID_DEDUCCION AS TIDECO,
    DB.ID_BENEFICIO AS BNCODI,
    2025 AS HPANPA,
    2 AS HPMEPA,
    SUM(PB.MONTO_APLICADO) AS HDVADE,
    0 AS HDVADO,
    'P' AS HDESTA,
    0 AS HDALIQ,
    0 AS HDMLIQ,
    0 AS HDDLIQ
FROM NET_DETALLE_DEDUCCION PB
JOIN NET_DETALLE_PAGO_BENEFICIO DB ON DB.ID_PERSONA = PB.ID_PERSONA
JOIN NET_PERSONA P ON P.ID_PERSONA = PB.ID_PERSONA
WHERE DB.ID_BENEFICIO != 6
  AND PB.ID_PLANILLA = 335
  AND DB.ID_PLANILLA = 335
  AND PB.ESTADO_APLICACION = 'COBRADA'
  AND DB.ESTADO = 'PAGADA'
GROUP BY
    P.ID_TIPO_IDENTIFICACION,
    P.N_IDENTIFICACION,
    PB.ID_DEDUCCION,
    DB.ID_BENEFICIO;

