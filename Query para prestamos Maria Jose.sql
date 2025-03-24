-----------------CUOTA_REAL--------------------------------
SELECT
ct.nombre_centro_trabajo AS INSTITUCION,
DD.MES,
DD.ANIO,
DD.N_PRESTAMO_INPREMA,
D.NOMBRE_DEDUCCION,
P.N_IDENTIFICACION,
TRIM(
              p.primer_apellido ||
              CASE
                  WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
                  ELSE ''
              END ||
              ' ' || p.primer_nombre ||
              CASE
                  WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
                  ELSE ''
              END ||
              CASE
                  WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
                  ELSE ''
              END
          ) AS nombre_completo,
DD.MONTO_TOTAL  CUOTA_REAL
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
ID_PLANILLA IN (335)
AND ct.nombre_centro_trabajo = 'INPREMA'
AND dd.estado_aplicacion = 'COBRADA';



-----------------CUOTA_PENDIENTE_APLICAR--------------------------------
SELECT
    ct.nombre_centro_trabajo AS INSTITUCION,
    DD.MES,
    DD.ANIO,
    DD.N_PRESTAMO_INPREMA,
    D.NOMBRE_DEDUCCION,
    P.N_IDENTIFICACION,
    TRIM(
        p.primer_apellido ||
        CASE
            WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
            ELSE ''
        END ||
        ' ' || p.primer_nombre ||
        CASE
            WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
            ELSE ''
        END ||
        CASE
            WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
            ELSE ''
        END
    ) AS nombre_completo,
    DD.MONTO_TOTAL - DD.MONTO_APLICADO AS CUOTA_PENDIENTE_APLICAR
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
    ID_PLANILLA IN (335)
    AND ct.nombre_centro_trabajo = 'INPREMA'
    AND dd.estado_aplicacion = 'COBRADA'
    AND (DD.MONTO_TOTAL - DD.MONTO_APLICADO) > 0.0;
   
-----------------CUOTA APLICADA PRESTAMOS INPREMA--------------------------------
SELECT
ct.nombre_centro_trabajo AS INSTITUCION,
DD.MES,
DD.ANIO,
DD.N_PRESTAMO_INPREMA,
D.NOMBRE_DEDUCCION,
P.N_IDENTIFICACION,
TRIM(
              p.primer_apellido ||
              CASE
                  WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
                  ELSE ''
              END ||
              ' ' || p.primer_nombre ||
              CASE
                  WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
                  ELSE ''
              END ||
              CASE
                  WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
                  ELSE ''
              END
          ) AS nombre_completo,
DD.MONTO_APLICADO CUOTA_APLICADA
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
ID_PLANILLA IN (335)
AND ct.nombre_centro_trabajo = 'INPREMA'
AND d.nombre_deduccion = 'PRESTAMOS INPREMA'
AND dd.estado_aplicacion = 'COBRADA';


--CUOTA APLICADA PRESTAMOS INPREMA COB
SELECT
ct.nombre_centro_trabajo AS INSTITUCION,
DD.MES,
DD.ANIO,
DD.N_PRESTAMO_INPREMA,
D.NOMBRE_DEDUCCION,
P.N_IDENTIFICACION,
TRIM(
              p.primer_apellido ||
              CASE
                  WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
                  ELSE ''
              END ||
              ' ' || p.primer_nombre ||
              CASE
                  WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
                  ELSE ''
              END ||
              CASE
                  WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
                  ELSE ''
              END
          ) AS nombre_completo,
DD.MONTO_APLICADO CUOTA_APLICADA
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
ID_PLANILLA IN (335)
AND ct.nombre_centro_trabajo = 'INPREMA'
AND d.nombre_deduccion = 'PRESTAMOS INPREMA COB'
AND dd.estado_aplicacion = 'COBRADA';

--CUOTA APLICADA PRESTAMOS INPREMA INT
SELECT
ct.nombre_centro_trabajo AS INSTITUCION,
DD.MES,
DD.ANIO,
DD.N_PRESTAMO_INPREMA,
D.NOMBRE_DEDUCCION,
P.N_IDENTIFICACION,
TRIM(
              p.primer_apellido ||
              CASE
                  WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
                  ELSE ''
              END ||
              ' ' || p.primer_nombre ||
              CASE
                  WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
                  ELSE ''
              END ||
              CASE
                  WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
                  ELSE ''
              END
          ) AS nombre_completo,
DD.MONTO_APLICADO CUOTA_APLICADA
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
ID_PLANILLA IN (335)
AND ct.nombre_centro_trabajo = 'INPREMA'
AND d.nombre_deduccion = 'PRESTAMOS INPREMA INT'
AND dd.estado_aplicacion = 'COBRADA';



--------------------------------------------*******************************************************----------------------------------------********************
-----------------CUOTA_REAL--------------------------------
SELECT
ct.nombre_centro_trabajo AS INSTITUCION,
DD.MES,
DD.ANIO,
DD.N_PRESTAMO_INPREMA,
D.NOMBRE_DEDUCCION,
P.N_IDENTIFICACION,
TRIM(
              p.primer_apellido ||
              CASE
                  WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
                  ELSE ''
              END ||
              ' ' || p.primer_nombre ||
              CASE
                  WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
                  ELSE ''
              END ||
              CASE
                  WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
                  ELSE ''
              END
          ) AS nombre_completo,
DD.MONTO_TOTAL  CUOTA_REAL
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
ID_PLANILLA IN (335)
AND ct.nombre_centro_trabajo = 'INPREMA'
AND dd.estado_aplicacion = 'COBRADA'
AND dd.id_deduccion in (1,75,76)
;



-----------------CUOTA_PENDIENTE_APLICAR--------------------------------
SELECT
    ct.nombre_centro_trabajo AS INSTITUCION,
    DD.MES,
    DD.ANIO,
    DD.N_PRESTAMO_INPREMA,
    D.NOMBRE_DEDUCCION,
    P.N_IDENTIFICACION,
    TRIM(
        p.primer_apellido ||
        CASE
            WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
            ELSE ''
        END ||
        ' ' || p.primer_nombre ||
        CASE
            WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
            ELSE ''
        END ||
        CASE
            WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
            ELSE ''
        END
    ) AS nombre_completo,
    DD.MONTO_TOTAL - DD.MONTO_APLICADO AS CUOTA_PENDIENTE_APLICAR
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
    ID_PLANILLA IN (335)
    AND ct.nombre_centro_trabajo = 'INPREMA'
    AND dd.estado_aplicacion = 'COBRADA'
    AND (DD.MONTO_TOTAL - DD.MONTO_APLICADO) > 0.0;
    
-----------------CUOTA APLICADA PRESTAMOS INPREMA--------------------------------
SELECT
ct.nombre_centro_trabajo AS INSTITUCION,
DD.MES,
DD.ANIO,
DD.N_PRESTAMO_INPREMA,
D.NOMBRE_DEDUCCION,
P.N_IDENTIFICACION,
TRIM(
              p.primer_apellido ||
              CASE
                  WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
                  ELSE ''
              END ||
              ' ' || p.primer_nombre ||
              CASE
                  WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
                  ELSE ''
              END ||
              CASE
                  WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
                  ELSE ''
              END
          ) AS nombre_completo,
DD.MONTO_APLICADO CUOTA_APLICADA
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
ID_PLANILLA IN (335)
AND ct.nombre_centro_trabajo = 'INPREMA'
AND d.nombre_deduccion = 'PRESTAMOS INPREMA'
AND dd.estado_aplicacion = 'COBRADA';


--CUOTA APLICADA PRESTAMOS INPREMA COB
SELECT
ct.nombre_centro_trabajo AS INSTITUCION,
DD.MES,
DD.ANIO,
DD.N_PRESTAMO_INPREMA,
D.NOMBRE_DEDUCCION,
P.N_IDENTIFICACION,
TRIM(
              p.primer_apellido ||
              CASE
                  WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
                  ELSE ''
              END ||
              ' ' || p.primer_nombre ||
              CASE
                  WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
                  ELSE ''
              END ||
              CASE
                  WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
                  ELSE ''
              END
          ) AS nombre_completo,
DD.MONTO_APLICADO CUOTA_APLICADA
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
ID_PLANILLA IN (335)
AND ct.nombre_centro_trabajo = 'INPREMA'
AND d.nombre_deduccion = 'PRESTAMOS INPREMA COB'
AND dd.estado_aplicacion = 'COBRADA';

--CUOTA APLICADA PRESTAMOS INPREMA INT
SELECT
ct.nombre_centro_trabajo AS INSTITUCION,
DD.MES,
DD.ANIO,
DD.N_PRESTAMO_INPREMA,
D.NOMBRE_DEDUCCION,
P.N_IDENTIFICACION,
TRIM(
              p.primer_apellido ||
              CASE
                  WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido
                  ELSE ''
              END ||
              ' ' || p.primer_nombre ||
              CASE
                  WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre
                  ELSE ''
              END ||
              CASE
                  WHEN p.tercer_nombre IS NOT NULL THEN ' ' || p.tercer_nombre
                  ELSE ''
              END
          ) AS nombre_completo,
DD.MONTO_APLICADO CUOTA_APLICADA
FROM NET_DETALLE_DEDUCCION DD
JOIN NET_PERSONA P ON P.ID_PERSONA = DD.ID_PERSONA  
JOIN NET_DEDUCCION D ON D.ID_DEDUCCION = DD.ID_DEDUCCION  
JOIN NET_CENTRO_TRABAJO CT ON ct.id_centro_trabajo = d.id_centro_trabajo
WHERE
ID_PLANILLA IN (335)
AND ct.nombre_centro_trabajo = 'INPREMA'
AND d.nombre_deduccion = 'PRESTAMOS INPREMA INT'
AND dd.estado_aplicacion = 'COBRADA';