# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# RogueFable3 —— 纯静态网页游戏（index.html + Phaser + 纯 JS，无构建步骤）
# 只需把仓库内容原样丢给 nginx 即可运行，因此镜像非常薄。
# ---------------------------------------------------------------------------

FROM nginx:1.27-alpine AS base

# 替换默认站点、写入压缩与缓存策略
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/game.conf

# 游戏本体（.dockerignore 已排除 .git / 工具目录等）
COPY . /usr/share/nginx/html/

# docker/ 必须留在构建上下文里（上面要从中取 nginx.conf），
# 但它和 Dockerfile / README 都不该被 nginx 当静态资源公开，COPY 之后清掉。
RUN rm -rf /usr/share/nginx/html/docker \
 && rm -f  /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/.dockerignore \
           /usr/share/nginx/html/.gitattributes \
           /usr/share/nginx/html/README.md \
           /usr/share/nginx/html/docker-compose.yml

# 静态资源统一属主，nginx worker 以 nginx 用户运行
RUN chown -R nginx:nginx /usr/share/nginx/html \
 && nginx -t

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/index.html || exit 1

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
