import java.util.zip.ZipFile;
import java.util.zip.ZipEntry;
import java.io.InputStream;
import java.util.Scanner;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.nio.charset.StandardCharsets;

public class ReadDocx {
    public static void main(String[] args) throws Exception {
        try (ZipFile zip = new ZipFile("LMS_SRS_v1.0.docx")) {
            ZipEntry entry = zip.getEntry("word/document.xml");
            if (entry != null) {
                try (InputStream is = zip.getInputStream(entry);
                     Scanner sc = new Scanner(is, "UTF-8").useDelimiter("\\A");
                     BufferedWriter bw = new BufferedWriter(new FileWriter("srs.txt", StandardCharsets.UTF_8))) {
                    String xml = sc.hasNext() ? sc.next() : "";
                    xml = xml.replaceAll("</w:p>", "\n");
                    String text = xml.replaceAll("<[^>]+>", " ");
                    bw.write(text);
                }
            } else {
                System.out.println("No word/document.xml found");
            }
        }
    }
}
