<%@ page import="java.io.*, java.util.*" %><%
    // TODO: support client-specified IDs for differentiating between stores.
	if (request.getParameter("nuke") != null || request.getParameter("all") != null) {
        // nuke() and all()
        boolean isNuke = (request.getParameter("nuke") != null);
        boolean isAll = (request.getParameter("all") != null);
		Enumeration attributeNames=(request.getSession(false)).getAttributeNames();
        StringBuffer all = new StringBuffer("[");
        while(attributeNames.hasMoreElements()){
            String attributeName=(String) attributeNames.nextElement();
            if (isNuke) {
                session.removeAttribute(attributeName);
            } else {
                all.append((String)session.getAttribute(attributeName));
                all.append(",");
            }
        }
        if (isAll) {
            if (all.length() > 1) all.deleteCharAt(all.length()-1); // trim trailing comma
            all.append("]");
            out.print(all.toString());
        } else {
            out.print("{}");
        }
	} else if (request.getParameter("get") != null) {
		// get()
        String key = request.getParameter("get");
        StringBuffer json = new StringBuffer();
        json.append((String)session.getAttribute(key));
        out.print(json.toString());
    } else if (request.getParameter("remove") != null) {
        // remove()
        String key = request.getParameter("remove");
        StringBuffer json = new StringBuffer();
        json.append((String)session.getAttribute(key));
        session.removeAttribute(key);
        out.print(json.toString());
	} else if (request.getParameter("save") != null) {
        // save()
        String key = request.getParameter("save");
		// Grab POST data
		BufferedReader FormBuffer = request.getReader();
		StringBuffer BodyContent = new StringBuffer();
		String NextLine = FormBuffer.readLine();
		while (NextLine != null) {
			BodyContent.append(NextLine);
			NextLine = FormBuffer.readLine();
		}
		// Save to session attribute
		session.setAttribute(key, BodyContent.toString());
		out.print(BodyContent.toString());
    }
%>