FROM nginx:alpine

# Copy custom Nginx configuration to support Single Page Application (SPA) routing
COPY infra/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Clean up default public HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy pre-compiled frontend assets from build runner
COPY dist/ /usr/share/nginx/html/

# Expose port 80 (to be mapped via Quadlet to host 3200)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
