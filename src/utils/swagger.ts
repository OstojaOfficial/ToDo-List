import {Express, Request, Response} from 'express';
import swaggerJsdocs from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdocs.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: 'RESTful API docs for Better ToDo List',
			version: '1.0.0'
		},
		components: {
			securitySchemas: {
				bearerAuth: {
					type: 'http',
					schema: 'bearer',
					bearerFormat: "JWT",
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			}
		]
	},
	apis: ['./src/server.ts']
};

const DisableTryItOutPlugin = function() {
	return {
	  statePlugins: {
		spec: {
		  wrapSelectors: {
			allowTryItOutFor: () => () => false
		  }
		}
	  }
	}
  }
  
const swaggerOptions = {
	swaggerOptions: {
		plugins: [
			 DisableTryItOutPlugin
		]
	 }
  };

const swaggerSpec = swaggerJsdocs(options);

function swaggerDocs(app: Express, port: number | undefined) {
	// Swagger page
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

	// Docs in JSON format
	app.get('/docs.json', (req: Request, res: Response) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});
}

export default swaggerDocs;