function handler(event) {
  var response = event.request;
  var host = response.headers.host.value;
  var uri = response.uri;

  // wwwがサブドメインにない場合は付けてリダイレクト
  if (!host.includes("cloudfront.net") && !host.startsWith("www")) {
    return {
      statusCode: 308,
      statusDescription: "Permanent Redirect",
      headers: {
        location: {
          value: `https://www.${host}${uri}`,
        },
      },
    };
  }
  // Check whether the URI is missing a file name.
  if (uri.endsWith("/")) {
    response.uri += "index.html";
  }
  // Check whether the URI is missing a file extension.
  else if (!uri.includes(".")) {
    response = {
      statusCode: 308,
      statusDescription: "Permanent Redirect",
      headers: { location: { value: (response.uri += "/") } },
    };
  }

  return response;
}
