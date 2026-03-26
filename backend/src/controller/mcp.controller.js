import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import dataService from "../service/data.service.js";
import { deviceApi } from "../api/api.js"; 

const router = express.Router();

const server = new McpServer({
    name: "Smart Farm MCP Server",
    version: "1.0.0",
});

server.tool(
    "get-latest-sensor-data",
    "Get real-time temperature, humidity, soil moisture and light levels",
    {},
    async () => {
        const data = await dataService.getLatest();
        const isOnline = await dataService.isSystemOnline();
        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: isOnline ? "Online" : "Offline",
                    data: data,
                    timestamp: new Date().toISOString()
                })
            }]
        };
    }
);

server.tool(
    "control-fan",
    "Change fan speed or toggle fan state",
    {
        value: z.number().min(0).max(100).describe("Fan speed percentage (0-100)")
    },
    async ({ value }) => {
        await deviceApi.toggleDevice({ device: "fan", value });
        return {
            content: [{ type: "text", text: `Fan value set to ${value}` }]
        };
    }
);

server.tool(
    "control-pump",
    "Change water pump value",
    {
        value: z.number().min(0).max(100).describe("Pump value percentage (0-100)")
    },
    async ({ value }) => {
        await deviceApi.toggleDevice({ device: "pump", value });
        return {
            content: [{ type: "text", text: `Pump value set to ${value}` }]
        };
    }
);

const transports = {};

router.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/api/mcp/message', res);
    transports[transport.sessionId] = transport;

    res.on('close', () => {
        delete transports[transport.sessionId];
    });

    await server.connect(transport);
});

router.post("/message", async (req, res) => {
    const transport = transports[req.query.sessionId];
    if (!transport) {
        return res.status(400).send({ error: "No transport found" });
    }
    await transport.handlePostMessage(req, res, req.body);
});

export default router;