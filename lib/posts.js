import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
    // Obtiene los nombres de archivos de /posts
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames.map((fileName) => {
        // Remueve ".md" del nombre del archivo para obtener el id2
        const id = fileName.replace(/\.md$/, '');

        // Lee el archivo markdow como una cadena
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf-8');

        // Usamos gray-matter para convertir los metadatos
        const matterResult = matter(fileContents);

        // Combina los datos con el id
        return {
            id,
            ...matterResult.data,
        };
    });

    // Ordena los posts por fecha
    return allPostsData.sort(({ date: a}, { date: b}) => {
        if (a < b){
            return 1;
        } else if (a > b) {
            return -1;
        } else {
            return 0;
        }
    });
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);

    // Regresa un arreglo que luce como este:
    // [
    //  {
    //      params: {
    //          id: 'ssg-ssr'
    //      }
    //  },
    //  {
    //      params: {
    //          id: 'pre-rendering'
    //      }
    //  }
    // ]

    return fileNames.map((fileName) => {
        return {
            params: {
                id: fileName.replace(/\.md$/,''),
            },
        };
    });
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf-8');

    // Usamos gray-matter para convertir los metadatos
    const matterResult = matter(fileContents);

    // Usamos remark para vonvertir markdown en una cadena html
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        ...matterResult.data,
    };
}