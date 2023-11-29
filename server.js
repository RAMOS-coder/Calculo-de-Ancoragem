const { google } = require('googleapis');
const fs = require('fs');
const bodyParser = require('body-parser');


const express = require('express');
const app = express();
const port = 3000;

// Configuração para servir arquivos estáticos
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/images', express.static(__dirname + '/images'));

// Configurar o body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Rota para enviar o arquivo index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Caminho para o arquivo JSON com as credenciais do Google
const CREDENTIALS_PATH = './credentials.json';

// ID do modelo do documento no Google Drive
const TEMPLATE_DOCUMENT_ID = '1dlSuR-9gP-2xxoKMKTkGO9hiaa35FL6MFojhZ4yyxkQ';

// Rota para gerar e fazer o download do documento
app.get('/gerar', async (req, res) => {
  try {
    // Carregar as credenciais do arquivo JSON
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

    // Criar um cliente OAuth2 usando as credenciais e escopos
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive' ],
    });

    // Criar um cliente para a API do Google Drive
    const drive = google.drive({ version: 'v3', auth });

    // Cria um cliente para a API do Google Docs
    const docsClient = google.docs({ version: 'v1', auth });

    // Receber os dados do lado do cliente
    const data = req.query;

    // Obter o ID do documento modelo
    const templateFile = await drive.files.get({ fileId: TEMPLATE_DOCUMENT_ID, fields: 'id' });
    const templateFileId = templateFile.data.id;

    // Criar uma cópia do documento modelo
    const copyResponse = await drive.files.copy({
      fileId: templateFileId,
      requestBody: {
        name: 'Documento Modificado',
      },
    });

    // ID do documento criado
    const newFileId = copyResponse.data.id;

    const updateOperations = [
      {
        replaceAllText: {
          containsText: {
            text: '{{valor1}}',
            matchCase: true,
          },
          replaceText: data.poste,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor2}}',
            matchCase: true,
          },
          replaceText: data.alca,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor3}}',
            matchCase: true,
          },
          replaceText: data.bap,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor4}}',
            matchCase: true,
          },
          replaceText: data.parafuso,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor5}}',
            matchCase: true,
          },
          replaceText: data.isolador,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor6}}',
            matchCase: true,
          },
          replaceText: data.suporteBap,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor7}}',
            matchCase: true,
          },
          replaceText: data.suporteSir,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor8}}',
            matchCase: true,
          },
          replaceText: data.supa,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor9}}',
            matchCase: true,
          },
          replaceText: data.optloop,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor10}}',
            matchCase: true,
          },
          replaceText: data.cordoalhaCEO,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{valor11}}',
            matchCase: true,
          },
          replaceText: data.cordoalhaCabo,
        },
      },
    ];

    await docsClient.documents.batchUpdate({
      documentId: newFileId,
      requestBody: {
        requests: updateOperations,
      }
    });

    // Exportar o documento modelo como DOCX
    const exportResponse = await drive.files.export({
      fileId: newFileId,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }, { responseType: 'arraybuffer' });

    // Configurar os cabeçalhos para o download do arquivo DOCX
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename=documento.docx',
    });

    // Enviar o arquivo DOCX para download no navegador
    res.send(Buffer.from(exportResponse.data));
  } catch (error) {
    console.error('Erro ao gerar o documento:', error);
    res.status(500).send({ error: 'Erro ao gerar o documento.' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});