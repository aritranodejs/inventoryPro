import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Multi-Tenant Inventory Management API',
            version: '1.0.0',
            description: 'A comprehensive multi-tenant SaaS inventory management system with support for product variants, suppliers, purchase orders, and real-time stock tracking.',
            contact: {
                name: 'API Support',
                email: 'support@inventory.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'https://api.inventory.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        }
                    }
                },
                PaginationResponse: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'number',
                            example: 1
                        },
                        limit: {
                            type: 'number',
                            example: 20
                        },
                        total: {
                            type: 'number',
                            example: 100
                        },
                        pages: {
                            type: 'number',
                            example: 5
                        }
                    }
                },
                Variant: {
                    type: 'object',
                    properties: {
                        sku: {
                            type: 'string',
                            example: 'TSHIRT-M-RED'
                        },
                        attributes: {
                            type: 'object',
                            additionalProperties: {
                                type: 'string'
                            },
                            example: { Size: 'M', Color: 'Red' }
                        },
                        price: {
                            type: 'number',
                            example: 29.99
                        },
                        stock: {
                            type: 'number',
                            example: 100
                        }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            example: '507f1f77bcf86cd799439011'
                        },
                        tenantId: {
                            type: 'string',
                            example: '507f1f77bcf86cd799439011'
                        },
                        name: {
                            type: 'string',
                            example: 'Premium T-Shirt'
                        },
                        description: {
                            type: 'string',
                            example: '100% Cotton comfortable t-shirt'
                        },
                        category: {
                            type: 'string',
                            example: 'Clothing'
                        },
                        variants: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Variant'
                            }
                        },
                        lowStockThreshold: {
                            type: 'number',
                            example: 10
                        }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        orderNumber: {
                            type: 'string',
                            example: 'ORD-000001'
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED'],
                            example: 'CONFIRMED'
                        },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: { type: 'string' },
                                    variantSku: { type: 'string' },
                                    quantity: { type: 'number' },
                                    price: { type: 'number' }
                                }
                            }
                        },
                        totalAmount: {
                            type: 'number',
                            example: 299.99
                        }
                    }
                },
                Supplier: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string', example: 'ABC Suppliers' },
                        email: { type: 'string', example: 'contact@abc.com' },
                        phone: { type: 'string', example: '+1234567890' },
                        address: { type: 'string' },
                        rating: { type: 'number', example: 4.5 }
                    }
                },
                PurchaseOrder: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        poNumber: { type: 'string', example: 'PO-000001' },
                        status: {
                            type: 'string',
                            enum: ['DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED'],
                            example: 'CONFIRMED'
                        },
                        supplierId: { type: 'string' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: { type: 'string' },
                                    variantSku: { type: 'string' },
                                    orderedQuantity: { type: 'number' },
                                    receivedQuantity: { type: 'number' },
                                    price: { type: 'number' }
                                }
                            }
                        },
                        totalAmount: { type: 'number' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
