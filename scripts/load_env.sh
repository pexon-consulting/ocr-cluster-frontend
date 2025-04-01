echo "(function (window) {" > /usr/share/nginx/html/env.js

echo "window.STAGE='$STAGE';" >> /usr/share/nginx/html/env.js

for ITEM in $(printenv | grep ENV_JS); do
        ITEM_CUT=$(echo "$ITEM" | cut -b 8-)
        ITEM_KEY=$(echo "$ITEM_CUT" | cut -d "=" -f 1)
        ITEM_VALUE=$(echo "$ITEM_CUT" | cut -d "=" -f 2)
    echo "window.${ITEM_KEY}='${ITEM_VALUE}';" >> /usr/share/nginx/html/env.js
done

echo "}(this));" >> /usr/share/nginx/html/env.js
