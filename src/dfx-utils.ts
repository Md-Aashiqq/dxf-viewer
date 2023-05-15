import * as THREE from 'three';
import DxfParser from 'dxf-parser';
import { computeBoundingBoxAndCenter } from './App';
//@ts-ignore
import * as earcut from "earcut";


export function parseDxfFile(dxfData: any) {
  const parser = new DxfParser();
  const dxf = parser.parseSync(dxfData);

  const group = new THREE.Group();
  let progress = 0;

  const totalEntities = dxf?.entities.length || 0;
  console.log("Total Entries", totalEntities)
  // Iterate through entities and create Three.js objects
  // based on the entity type (e.g., lines, circles, etc.)
  // @ts-ignore
  console.log(dxf?.entities);

  dxf?.entities.forEach((entity: any, index: number) => {
    let object;
    const entityColor = entity.color ? entity.color : 0x0000ff;
    // For lines:
    if (entity.type === 'LINE') {
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z),
        new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z),
      ]);
      object = new THREE.Line(geometry, material);
    }

    // For circles:
    if (entity.type === 'CIRCLE') {
      const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const geometry = new THREE.CircleGeometry(entity.radius, 32);
      // @ts-ignore
      geometry.vertices.shift(); // Remove the center vertex
      object = new THREE.LineLoop(geometry, material);
      object.position.set(entity.center.x, entity.center.y, entity.center.z);
    }

    // For LWPOLYLINE:
    if (entity.type === 'LWPOLYLINE') {
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const geometry = new THREE.BufferGeometry().setFromPoints(
        entity.vertices.map((vertex: any) => new THREE.Vector3(vertex.x, vertex.y, vertex.z))
      );
      object = entity.closed ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material);
    }
    // For ARC entities
    if (entity.type === 'ARC') {
      const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
      const radius = entity.radius;
      const startAngle = entity.startAngle * (Math.PI / 180);
      const endAngle = entity.endAngle * (Math.PI / 180);
      const arcPoints = [];

      for (let angle = startAngle; angle <= endAngle; angle += Math.PI / 180) {
        arcPoints.push(new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
      object = new THREE.Line(geometry, material);
      object.position.set(entity.center.x, entity.center.y, entity.center.z);
    }

    // For POLYLINE:
    // if (entity.type === 'POLYLINE') {
    //   const material = new THREE.MeshStandardMaterial({ color: entity.color || 0xffffff });
    //   const geometry = new THREE.BufferGeometry().setFromPoints(
    //     entity.vertices.map((vertex: any) => new THREE.Vector3(vertex.x, vertex.y, vertex.z))
    //   );
    //   object = entity.closed ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material);
    // }

    if (entity.type === 'POLYLINE') {
      const material = new THREE.MeshStandardMaterial({ color: entity.color || 0xffffff });

      const vertices = entity.vertices.map((vertex: any) => new THREE.Vector3(vertex.x, vertex.y, vertex.z));
      const flatVertices = vertices.reduce((acc: any, v: any) => acc.concat([v.x, v.y, v.z]), []);
      const triangles = earcut(flatVertices);

      const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(triangles), 1));

      object = new THREE.Mesh(geometry, material);
    }

    // if (entity.type === 'POLYLINE') {
    //   const shape = new THREE.Shape();
    //   shape.moveTo(entity.vertices[0].x, entity.vertices[0].y);

    //   for (let i = 1; i < entity.vertices.length; i++) {
    //     shape.lineTo(entity.vertices[i].x, entity.vertices[i].y);
    //   }

    //   if (entity.closed) {
    //     shape.lineTo(entity.vertices[0].x, entity.vertices[0].y);
    //   }

    //   const geometry = new THREE.ShapeGeometry(shape);
    //   const material = new THREE.MeshStandardMaterial({ color: entity.color || 0xffffff });
    //   object = new THREE.Mesh(geometry, material);
    // }

    // For ELLIPSE:
    if (entity.type === 'ELLIPSE') {
      const material = new THREE.MeshStandardMaterial({ color: entity.color || 0xffffff });
      const rx = entity.majorAxisEndPoint.x - entity.center.x;
      const ry = rx * entity.axisRatio;
      const ellipseCurve = new THREE.EllipseCurve(
        entity.center.x, entity.center.y,
        rx, ry,
        entity.startAngle, entity.endAngle,
        false,  // Always counterclockwise
        0       // Start angle
      );
      const points = ellipseCurve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      object = new THREE.Line(geometry, material);
    }



    // For SPLINE entities
    if (entity.type === 'SPLINE') {
      const material = new THREE.LineBasicMaterial({ color: 0xffa500 });
      const controlPoints = entity.controlPoints.map(
        (point: any) => new THREE.Vector3(point.x, point.y, point.z)
      );
      const curve = new THREE.CatmullRomCurve3(controlPoints, false, 'centripetal');
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      object = new THREE.Line(geometry, material);
    }

    if (entity.type === 'POINT') {
      const material = new THREE.PointsMaterial({ color: entity.color ? `#${entity.color.toString(16)}` : 0xffa500, size: 0.01 }); // Points with size 0.01
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(entity.position.x, entity.position.y, entity.position.z)]);
      object = new THREE.Points(geometry, material);
    }


    // entity.color ? `#${entity.color.toString(16)}` :
    // if (entity.type === '3DFACE') {
    //   const material = new THREE.MeshBasicMaterial({
    //     color: entity.color ? `#${entity.color.toString(16)}` : 0xffa500,
    //     side: THREE.DoubleSide,
    //     // wireframe: true
    //   });


    //   const geometry = new THREE.BufferGeometry();
    //   const vertices = [];

    //   vertices.push(entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z);
    //   vertices.push(entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z);
    //   vertices.push(entity.vertices[2].x, entity.vertices[2].y, entity.vertices[2].z);

    //   // Check if a fourth vertex exists and is not the same as the third. If so, it's a four point face.
    //   if (entity.vertices[3] &&
    //     (entity.vertices[3].x !== entity.vertices[2].x ||
    //       entity.vertices[3].y !== entity.vertices[2].y ||
    //       entity.vertices[3].z !== entity.vertices[2].z)) {
    //     vertices.push(entity.vertices[3].x, entity.vertices[3].y, entity.vertices[3].z);
    //   }

    //   geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    //   object = new THREE.Mesh(geometry, material);
    // }

    // For 3DFACE entities
    if (entity.type === '3DFACE') {
      const material = new THREE.MeshLambertMaterial({
        color: entity.color ? `#${entity.color.toString(16)}` : 0xffa500,
        side: THREE.DoubleSide,
      });

      const vertices = new Float32Array([
        entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z,
        entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z,
        entity.vertices[2].x, entity.vertices[2].y, entity.vertices[2].z
      ]);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

      // If there is a fourth vertex and it is different from the third vertex, create a second triangular face.
      if (entity.vertices[3] &&
        (entity.vertices[3].x !== entity.vertices[2].x ||
          entity.vertices[3].y !== entity.vertices[2].y ||
          entity.vertices[3].z !== entity.vertices[2].z)) {
        const vertices2 = new Float32Array([
          entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z,
          entity.vertices[2].x, entity.vertices[2].y, entity.vertices[2].z,
          entity.vertices[3].x, entity.vertices[3].y, entity.vertices[3].z
        ]);

        const geometry2 = new THREE.BufferGeometry();
        geometry2.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
        const object2 = new THREE.Mesh(geometry2, material);
        group.add(object2);
      }
      geometry.computeVertexNormals();

      object = new THREE.Mesh(geometry, material);
    }



    progress = (index + 1) / totalEntities;

    console.log(progress)
    if (!object) {
      console.log('Unhandled entity type:', entity);
    } else {
      // console.log(object)
      group.add(object);
    }
  });
  // group.scale.set(0.4, 0.4, 0.4);
  const { size, center } = computeBoundingBoxAndCenter(group);
  const scale = 0.4 / Math.max(size.x, size.y, size.z);
  group.scale.set(scale, scale, scale);
  group.position.sub(center.clone().multiplyScalar(scale));

  // const helper = new THREE.VertexNormalsHelper(object, 2, 0x00ff00, 1);

  return group;
}


 // For 3DFACE entities
    // if (entity.type === '3DFACE') {
    //   const material = new THREE.MeshBasicMaterial({
    //     color: entity.color ? `#${entity.color.toString(16)}` : 0xffa500,
    //     side: THREE.DoubleSide,
    //   });

    //   const geometry = new THREE.Geometry();

    //   geometry.vertices.push(
    //     new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z),
    //     new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z),
    //     new THREE.Vector3(entity.vertices[2].x, entity.vertices[2].y, entity.vertices[2].z)
    //   );

    //   geometry.faces.push(new THREE.Face3(0, 1, 2));

    //   // Check if a fourth vertex exists and is not the same as the third. If so, it's a four-point face.
    //   if (entity.vertices[3] &&
    //     (entity.vertices[3].x !== entity.vertices[2].x ||
    //       entity.vertices[3].y !== entity.vertices[2].y ||
    //       entity.vertices[3].z !== entity.vertices[2].z)) {
    //     geometry.vertices.push(new THREE.Vector3(entity.vertices[3].x, entity.vertices[3].y, entity.vertices[3].z));
    //     geometry.faces.push(new THREE.Face3(0, 2, 3));
    //   }

    //   geometry.computeFaceNormals();

    //   object = new THREE.Mesh(geometry, material);
    // }


    // if (entity.type === '3DFACE') {
    //   const material = new THREE.MeshBasicMaterial({ color: entityColor, side: THREE.DoubleSide });
    //   const geometry = new THREE.Geometry();
    //   geometry.vertices = entity.vertices.map(vertex => new THREE.Vector3(vertex.x, vertex.y, vertex.z));
    //   if (geometry.vertices.length === 4) {
    //     geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(0, 2, 3));
    //   } else {
    //     geometry.faces.push(new THREE.Face3(0, 1, 2));
    //   }
    //   object = new THREE.Mesh(geometry, material);
    // }

    // if (entity.type === '3DFACE') {
    //   const material = new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide });
    //   const vertices = entity.vertices.flatMap((vertex: any) => [vertex.x, vertex.y, vertex.z]);
    //   const geometry = new THREE.BufferGeometry();
    //   geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    //   if (vertices.length / 3 === 4) {
    //     geometry.setIndex([0, 1, 2, 0, 2, 3]);  // two triangles for a quad face
    //   } else {
    //     geometry.setIndex([0, 1, 2]);  // single triangle for a triangular face
    //   }
    //   object = new THREE.Mesh(geometry, material);
    // }

    // if (entity.type === '3DFACE') {
    //   const material = new THREE.MeshBasicMaterial({
    //     color: entity.color ? `#${entity.color.toString(16)}` : 0xffffff,
    //     side: THREE.DoubleSide
    //   });

    //   const geometry = new THREE.BufferGeometry();
    //   const vertices = [];

    //   vertices.push(entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z);
    //   vertices.push(entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z);
    //   vertices.push(entity.vertices[2].x, entity.vertices[2].y, entity.vertices[2].z);

    //   // Check if the fourth point is not the same as the third. If so, it's a four point face.
    //   if (entity.vertices[3].x !== entity.vertices[2].x ||
    //     entity.vertices[3].y !== entity.vertices[2].y ||
    //     entity.vertices[3].z !== entity.vertices[2].z) {
    //     vertices.push(entity.vertices[3].x, entity.vertices[3].y, entity.vertices[3].z);
    //   }

    //   geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    //   object = new THREE.Mesh(geometry, material);
    // }
