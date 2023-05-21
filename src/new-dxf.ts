import * as THREE from 'three';
import DxfParser from 'dxf-parser';
import { computeBoundingBoxAndCenter } from './App';
// @ts-ignore
import * as earcut from 'earcut';

export async function parseDxfFile(dxfData: any) {
  const parser = new DxfParser();
  const dxf = parser.parseSync(dxfData);
  const group = new THREE.Group();
  const faceVertices: any = [];
  const faceColors: any = [];

  const handleEntity = (entity: any) => {
    let object;
    const entityColor = entity.color ? `#${entity.color.toString(16)}` : 0x0000ff;
    console.log(entity.type)
    switch (entity.type) {
      case 'LINE':
        break;
      // Line handling...

      case 'POLYLINE':
        const polylineMaterial = new THREE.MeshStandardMaterial({ color: entityColor });

        const vertices = entity.vertices.map((vertex: any) => new THREE.Vector3(vertex.x, vertex.y, vertex.z));

        // Flatten the vertices array and triangulate
        const flatVertices = vertices.reduce((acc: any, v: any) => acc.concat([v.x, v.y, v.z]), []);
        const triangles = earcut(flatVertices);

        const polylineGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
        polylineGeometry.setIndex(triangles);
        polylineGeometry.computeVertexNormals();
        object = new THREE.Mesh(polylineGeometry, polylineMaterial);
        break;

      // case 'POLYLINE':
      //   const polylineMaterial = new THREE.MeshStandardMaterial({ color: entityColor });

      //   const vertices = entity.vertices.map((vertex: any) => new THREE.Vector3(vertex.x, vertex.y, vertex.z));

      //   // Manually creating a fan triangulation
      //   const indices = [];
      //   for (let i = 1; i < vertices.length - 1; i++) {
      //     indices.push(0, i, i + 1);
      //   }

      //   const polylineGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
      //   polylineGeometry.setIndex(indices);
      //   polylineGeometry.computeVertexNormals();
      //   object = new THREE.Mesh(polylineGeometry, polylineMaterial);
      //   break;

      case 'INSERT':
        const block = dxf?.blocks[entity.name];
        if (!block) {
          console.log(`Block ${entity.name} not found.`);
          return;
        }

        if (!block.entities || block.entities.length === 0) {
          console.log(`Block ${entity.name} has no entities.`);
          return;
        }

        const blockGroup = new THREE.Group();
        blockGroup.position.set(entity.position.x, entity.position.y, entity.position.z);

        block?.entities?.forEach((blockEntity: any) => {
          const blockObject = handleEntity(blockEntity);
          if (blockObject) {
            blockGroup.add(blockObject);
          }
        });

        // Apply transformations based on the INSERT entity.
        if (entity.scaleX) {
          blockGroup.scale.x = entity.scaleX;
        }
        if (entity.scaleY) {
          blockGroup.scale.y = entity.scaleY;
        }
        if (entity.scaleZ) {
          blockGroup.scale.z = entity.scaleZ;
        }
        if (entity.rotation) {
          blockGroup.rotation.z = (entity.rotation * Math.PI) / 180; // assuming rotation is in degrees
        }

        object = blockGroup;
        break;

      case '3DFACE':
        for (let i = 0; i < 3; i++) {
          faceVertices.push(
            entity.vertices[i].x,
            entity.vertices[i].y,
            entity.vertices[i].z
          );
          const color = new THREE.Color(entity.color ? `#${entity.color.toString(16)}` : 0xffa500);
          // console.log(color);
          faceColors.push(color.r, color.g, color.b);
        }

        // If there is a fourth vertex and it is different from the third vertex, create a second triangular face.
        if (entity.vertices[3] &&
          (entity.vertices[3].x !== entity.vertices[2].x ||
            entity.vertices[3].y !== entity.vertices[2].y ||
            entity.vertices[3].z !== entity.vertices[2].z)) {
          for (let i = 0; i < 3; i++) {
            const index = i !== 2 ? i : 3;
            faceVertices.push(
              entity.vertices[index].x,
              entity.vertices[index].y,
              entity.vertices[index].z
            );
            const color = new THREE.Color(entity.color ? `#${entity.color.toString(16)}` : 0xffa500);
            faceColors.push(color.r, color.g, color.b);
          }
        }
        break;

      // Other cases...

      default:
        console.log('Unhandled entity type:', entity);
        break;
    }

    return object;
  }

  dxf?.entities.forEach((entity: any) => {
    const object = handleEntity(entity);
    if (object) {
      group.add(object);
    }
  });

  // Handling 3DFACE entities...
  const faceGeometry = new THREE.BufferGeometry();
  faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(faceVertices, 3));
  faceGeometry.setAttribute('color', new THREE.Float32BufferAttribute(faceColors, 3));
  faceGeometry.computeVertexNormals();
  const faceMaterial = new THREE.MeshLambertMaterial({
    side: THREE.DoubleSide,
    vertexColors: true
  });
  const faceObject = new THREE.Mesh(faceGeometry, faceMaterial);
  group.add(faceObject);

  const { size, center } = computeBoundingBoxAndCenter(group);
  const scale = 0.4 / Math.max(size.x, size.y, size.z);
  group.scale.set(scale, scale, scale);
  group.position.sub(center.clone().multiplyScalar(scale));

  return group;
}
