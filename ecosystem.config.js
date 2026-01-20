module.exports = {
    apps: [
        {
            name: "datasets",
            script: "npm",
            args: "start",
            instances: 1,
            autorestart: true,
            watch: false,
        },
    ],
};
